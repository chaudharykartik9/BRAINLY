import crypto from 'crypto';
import { BrainLink } from '../models/BrainLink.js';
import { Content } from '../models/Content.js';
import { User } from '../models/user.js';

export class BrainService {
  static async toggleShare(userId: string, isPublic: boolean) {
    if (!isPublic) {
      await BrainLink.deleteOne({ userId });
      return { hash: null, isPublic: false };
    }

    const existingLink = await BrainLink.findOne({ userId });
    if (existingLink) {
      return { hash: existingLink.hash, isPublic: true };
    }

    // Generate random 10-character unique hash
    const hash = crypto.randomBytes(5).toString('hex');
    const brainLink = await BrainLink.create({ hash, userId, isPublic: true });
    return { hash: brainLink.hash, isPublic: true };
  }

  static async getPublicBrain(hash: string) {
    const brainLink = await BrainLink.findOne({ hash, isPublic: true });
    if (!brainLink) throw new Error('Shared brain not found or link has expired');

    const user = await User.findById(brainLink.userId).select('username avatarUrl');
    const contents = await Content.find({ userId: brainLink.userId })
      .populate('tags', 'title')
      .sort({ isPinned: -1, createdAt: -1 });

    return { user, contents };
  }
}