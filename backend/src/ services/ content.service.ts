import { Content, ContentType } from "../models/Content.js";
import { Tag } from "../models/Tag.js";
import { Types } from "mongoose";

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

    const content = await Content.create({
      ...data,
      tags: tagIds,
      userId,
    });

    return content.populate("tags", "title");
  }

  static async getUserContents(userId: string, filterType?: string) {
    const query: Record<string, unknown> = { userId };
    if (filterType) {
      query.type = filterType;
    }
    return await Content.find(query)
      .populate("tags", "title")
      .sort({ isPinned: -1, createdAt: -1 }); // Pinned items first, then newest
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
    },
  ) {
    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.type !== undefined) update.type = data.type;
    if (data.link !== undefined) update.link = data.link;
    if (data.notes !== undefined) update.notes = data.notes;
    if (data.tags !== undefined) {
      update.tags = await ContentService.resolveTagIds(data.tags);
    }

    return await Content.findOneAndUpdate({ _id: contentId, userId }, update, {
      new: true,
    }).populate("tags", "title");
  }

  static async deleteContent(contentId: string, userId: string) {
    return await Content.findOneAndDelete({ _id: contentId, userId });
  }
}
