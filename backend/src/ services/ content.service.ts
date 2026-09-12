import { Content, ContentType } from "../models/Content.js";
import { Tag } from "../models/Tag.js";
import { Types } from "mongoose";
import { fetchLinkPreview } from "../utils/linkPreview.js";

const PREVIEW_ELIGIBLE_TYPES: ContentType[] = ["link", "article"];

/** Escapes regex metacharacters so user search input can't break or abuse the pattern. */
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface GetContentsOptions {
  type?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedContent {
  items: InstanceType<typeof Content>[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export class ContentService {
  /** Resolves tag titles to Tag ObjectIds, auto-creating any that don't exist yet. */
  private static async resolveTagIds(tagTitles: string[]): Promise<Types.ObjectId[]> {
    const tagIds: Types.ObjectId[] = [];

    for (const tagTitle of tagTitles) {
      const cleanTitle = tagTitle.toLowerCase().trim();
      if (!cleanTitle) continue;

      const tag = await Tag.findOneAndUpdate(
        { title: cleanTitle },
        { title: cleanTitle },
        { upsert: true, new: true },
      );
      tagIds.push(tag._id as Types.ObjectId);
    }

    return tagIds;
  }

  /** Best-effort OG scrape for link/article types — never throws, returns undefined on failure. */
  private static async maybeFetchMetadata(type: ContentType, link?: string) {
    if (!link || !PREVIEW_ELIGIBLE_TYPES.includes(type)) return undefined;
    return (await fetchLinkPreview(link).catch(() => null)) ?? undefined;
  }

  static async createContent(
    data: {
      title: string;
      type: ContentType;
      link?: string;
      notes?: string;
      tags?: string[];
      isPinned?: boolean;
    },
    userId: string,
  ) {
    const tagIds = data.tags?.length ? await ContentService.resolveTagIds(data.tags) : [];
    const metadata = await ContentService.maybeFetchMetadata(data.type, data.link);

    const content = await Content.create({
      ...data,
      tags: tagIds,
      userId,
      ...(metadata ? { metadata } : {}),
    });

    return content.populate("tags", "title");
  }

  static async getUserContents(
    userId: string,
    options: GetContentsOptions = {},
  ): Promise<PaginatedContent> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 24));

    const query: Record<string, unknown> = { userId };

    if (options.type) {
      query.type = options.type;
    }

    if (options.tag) {
      const tagDoc = await Tag.findOne({ title: options.tag.toLowerCase().trim() });
      if (!tagDoc) {
        return { items: [], total: 0, page, limit, pages: 1 };
      }
      query.tags = tagDoc._id;
    }

    if (options.search?.trim()) {
      const regex = new RegExp(escapeRegex(options.search.trim()), "i");
      const matchingTagIds = await Tag.find({ title: regex }).distinct("_id");
      query.$or = [
        { title: regex },
        { notes: regex },
        ...(matchingTagIds.length ? [{ tags: { $in: matchingTagIds } }] : []),
      ];
    }

    const [items, total] = await Promise.all([
      Content.find(query)
        .populate("tags", "title")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Content.countDocuments(query),
    ]);

    return { items, total, page, limit, pages: Math.max(1, Math.ceil(total / limit)) };
  }

  /** Distinct tags used on the given user's own content, with usage counts. */
  static async getUserTags(userId: string): Promise<{ title: string; count: number }[]> {
    return Content.aggregate([
      { $match: { userId: new Types.ObjectId(userId) } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $lookup: { from: "tags", localField: "_id", foreignField: "_id", as: "tag" } },
      { $unwind: "$tag" },
      { $project: { _id: 0, title: "$tag.title", count: 1 } },
      { $sort: { count: -1, title: 1 } },
    ]);
  }

  static async updateContent(
    contentId: string,
    userId: string,
    data: {
      title?: string;
      type?: ContentType;
      link?: string;
      notes?: string;
      tags?: string[];
      isPinned?: boolean;
    },
  ) {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.type !== undefined) update.type = data.type;
    if (data.isPinned !== undefined) update.isPinned = data.isPinned;
    if (data.notes !== undefined) update.notes = data.notes;
    if (data.tags !== undefined) {
      update.tags = await ContentService.resolveTagIds(data.tags);
    }

    if (data.link !== undefined) {
      update.link = data.link;

      // Re-scrape metadata whenever the link changes, using the new type if
      // one was sent, otherwise whatever type the item already has.
      const effectiveType =
        data.type ?? (await Content.findOne({ _id: contentId, userId }).select("type"))?.type;
      const metadata = effectiveType
        ? await ContentService.maybeFetchMetadata(effectiveType, data.link)
        : undefined;
      if (metadata) update.metadata = metadata;
    }

    return await Content.findOneAndUpdate({ _id: contentId, userId }, update, {
      new: true,
    }).populate("tags", "title");
  }

  static async deleteContent(contentId: string, userId: string) {
    return await Content.findOneAndDelete({ _id: contentId, userId });
  }

  static async deleteManyContents(contentIds: string[], userId: string): Promise<number> {
    const result = await Content.deleteMany({ _id: { $in: contentIds }, userId });
    return result.deletedCount ?? 0;
  }
}
