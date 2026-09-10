import crypto from 'crypto';
import { BrainLink } from '../models/BrainLink.js';
import { Content } from '../models/Content.js';
import { User } from '../models/user.js';

export class BrainService {
  /** Returns the user's public-page hash, creating the BrainLink if needed. */
  static async ensureBrainLink(userId: string): Promise<string> {
    const existing = await BrainLink.findOne({ userId });
    if (existing) return existing.hash;

    const hash = crypto.randomBytes(5).toString('hex');
    const created = await BrainLink.create({ hash, userId, isPublic: true });
    return created.hash;
  }

  static async toggleShare(userId: string, isPublic: boolean) {
    if (!isPublic) {
      // Take the whole public page offline. Per-item `isPublic` flags are
      // left untouched so the selection is restored if it's re-enabled.
      await BrainLink.deleteOne({ userId });
      return { hash: null, isPublic: false };
    }

    const hash = await BrainService.ensureBrainLink(userId);
    return { hash, isPublic: true };
  }

  /** Publish / unpublish a single content item. */
  static async setContentVisibility(
    userId: string,
    contentId: string,
    isPublic: boolean,
  ) {
    const content = await Content.findOneAndUpdate(
      { _id: contentId, userId },
      { isPublic },
      { new: true },
    ).populate('tags', 'title');

    if (!content) return null;

    // Publishing an item needs a live public page to host it.
    const hash = isPublic
      ? await BrainService.ensureBrainLink(userId)
      : (await BrainLink.findOne({ userId }))?.hash ?? null;

    return { content, hash };
  }

  static async getPublicBrain(hash: string) {
    const brainLink = await BrainLink.findOne({ hash });
    if (!brainLink) throw new Error('Shared brain not found or link has expired');

    const user = await User.findById(brainLink.userId).select('username avatarUrl');
    const content = await Content.find({ userId: brainLink.userId, isPublic: true })
      .populate('tags', 'title')
      .sort({ isPinned: -1, createdAt: -1 });

    return { username: user?.username ?? 'Someone', content };
  }

  static async getPublicContentItem(hash: string, contentId: string) {
    const brainLink = await BrainLink.findOne({ hash });
    if (!brainLink) throw new Error('Shared brain not found or link has expired');

    const content = await Content.findOne({
      _id: contentId,
      userId: brainLink.userId,
      isPublic: true,
    }).populate('tags', 'title');

    if (!content) throw new Error('This item is private or no longer exists');

    const user = await User.findById(brainLink.userId).select('username avatarUrl');

    return { username: user?.username ?? 'Someone', content };
  }
}
