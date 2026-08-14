import { Content, ContentType } from "../models/Content.js";
import { Tag } from "../models/Tag.js";
import { Types } from "mongoose";

export class ContentService {
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
    const tagIds: Types.ObjectId[] = [];

    // Auto-create tags if string names were passed
    if (data.tags && data.tags.length > 0) {
      for (const tagTitle of data.tags) {
        const cleanTitle = tagTitle.toLowerCase().trim();
        const tag = await Tag.findOneAndUpdate(
          { title: cleanTitle },
          { title: cleanTitle },
          { upsert: true, new: true },
        );
        tagIds.push(tag._id as Types.ObjectId);
      }
    }

    return await Content.create({
      ...data,
      tags: tagIds,
      userId,
    });
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

  static async deleteContent(contentId: string, userId: string) {
    return await Content.findOneAndDelete({ _id: contentId, userId });
  }
}
