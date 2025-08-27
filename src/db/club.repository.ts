import { connectToDatabase } from './mongo';
import { ClubModel } from './club.model';
import { MembershipModel } from './membership.model';
import { ClubRoleAssignmentModel } from './clubRole.model';
import { AttendanceModel } from './attendance.model';
import { MembershipRequestModel } from './membershipRequest.model';

export class ClubRepository {
  /**
   * Returns all clubs where the user is a member (active or inactive) or has an active clubrole.
   * Populates the memberships and roles for that user only.
   */
  async GetClubsForUser(userId: string) 
  {
  await connectToDatabase();
  const now = new Date();
  const mongoose = require('mongoose');
  const clubs = await ClubModel.aggregate([
    {
      $lookup: {
        from: 'memberships',
        let: { clubId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [
            { $eq: ['$club', '$$clubId'] },
            { $eq: ['$user', new mongoose.Types.ObjectId(userId)] }
          ] } } }
        ],
        as: 'memberships'
      }
    },
    {
      $lookup: {
        from: 'clubroleassignments',
        let: { clubId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [
            { $eq: ['$club', '$$clubId'] },
            { $eq: ['$user', new mongoose.Types.ObjectId(userId)] },
            { $or: [
              { $eq: ['$endDate', null] },
              { $gt: ['$endDate', now] },
              { $not: ['$endDate'] }
            ] }
          ] } } }
        ],
        as: 'roles'
      }
    },
    {
      $match: {
        $or: [
          { 'memberships.0': { $exists: true } },
          { 'roles.0': { $exists: true } }
        ]
      }
    }
  ]);
  return clubs;
}

  async getAllClubs() {
    await connectToDatabase();
    return ClubModel.find({}).lean();
  }

  /**
   * Get clubs filtered by name, discipline, and optionally by distance from a postcode.
   * If location and distance are provided, uses $near for geospatial filtering.
   */
  async getFilteredClubs({ name, discipline, postcode, distance, userLocation }: {
    name?: string;
    discipline?: string;
    postcode?: string;
    distance?: number;
    userLocation?: { lat: number; lng: number };
  }) {
    await connectToDatabase();
    const query: any = {};
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (discipline && discipline !== '*') {
      query.disciplines = discipline;
    }
    // If userLocation and distance are provided, use $near
    if (userLocation && distance) {
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat],
          },
          $maxDistance: distance * 1609.34, // miles to meters
        },
      };
    } else if (postcode) {
      // fallback: text search on postcode/address
      query.$or = [
        { address: { $regex: postcode, $options: 'i' } },
        { postcode: { $regex: postcode, $options: 'i' } },
      ];
    }
    return ClubModel.find(query).lean();
  }
  async getClubById(clubId: string) {
    await connectToDatabase();
    // Use aggregation to slice and sort news, and populate news.author
    const mongoose = require('mongoose');
    const result = await ClubModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(clubId) } },
      { $addFields: {
          news: {
            $slice: [
              {
                $sortArray: {
                  input: "$news",
                  sortBy: { published: -1 }
                }
              },
              5
            ]
          }
        }
      },
      { $unwind: { path: "$news", preserveNullAndEmptyArrays: true } },
      { $lookup: {
          from: "users",
          localField: "news.author",
          foreignField: "_id",
          as: "authorObj"
        }
      },
      { $addFields: {
          "news.author": { $arrayElemAt: ["$authorObj", 0] }
        }
      },
      { $project: { authorObj: 0 } },
      { $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          news: { $push: "$news" }
        }
      },
      { $addFields: { "doc.news": "$news" } },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
    if (!result || !result[0]) return null;
    return result[0];
  }

  async getClubByName(name: string) {
    await connectToDatabase();
    const mongoose = require('mongoose');
    // Find the club and populate news as before
    const result = await ClubModel.aggregate([
      { $match: { name: { $regex: `^${name}$`, $options: 'i' } } },
      { $addFields: {
          news: {
            $slice: [
              {
                $sortArray: {
                  input: "$news",
                  sortBy: { published: -1 }
                }
              },
              5
            ]
          }
        }
      },
      { $unwind: { path: "$news", preserveNullAndEmptyArrays: true } },
      { $lookup: {
          from: "users",
          localField: "news.author",
          foreignField: "_id",
          as: "authorObj"
        }
      },
      { $addFields: {
          "news.author": { $arrayElemAt: ["$authorObj", 0] }
        }
      },
      { $project: { authorObj: 0 } },
      { $group: {
          _id: "$_id",
          doc: { $first: "$$ROOT" },
          news: { $push: "$news" }
        }
      },
      { $addFields: { "doc.news": "$news" } },
      { $replaceRoot: { newRoot: "$doc" } }
    ]);
    if (!result || !result[0]) return null;
    const club = result[0];

    // Get member count
    const memberCount = await MembershipModel.countDocuments({ club: club._id });
    club.memberCount = memberCount;
    // Compute memberCountCategory
    if (memberCount < 15) club.memberCountCategory = '< 15';
    else if (memberCount < 20) club.memberCountCategory = '15-20';
    else if (memberCount < 40) club.memberCountCategory = '20-40';
    else club.memberCountCategory = '40+';
    return club;
  }

  async addMember(userId: string, clubId: string, startDate: Date) {
    await connectToDatabase();
    return MembershipModel.create({ user: userId, club: clubId, startDate });
  }

  async getMembers(clubId: string) {
    await connectToDatabase();
    return MembershipModel.find({ club: clubId });
  }

  async assignRole(userId: string, clubId: string, role: string, startDate: Date, endDate?: Date) {
    await connectToDatabase();
    return ClubRoleAssignmentModel.create({ user: userId, club: clubId, role, startDate, endDate });
  }

  async getRoles(clubId: string) {
    await connectToDatabase();
    return ClubRoleAssignmentModel.find({ club: clubId });
  }

  async createAttendance(userId: string, clubId: string, timeIn: Date, reason: string, options?: { timeOut?: Date, clubRepresented?: string, firearmUsed?: string }) {
    await connectToDatabase();
    return AttendanceModel.create({
      user: userId,
      club: clubId,
      timeIn,
      timeOut: options?.timeOut,
      reason,
      clubRepresented: options?.clubRepresented,
      firearmUsed: options?.firearmUsed
    });
  }

  async getAttendance(clubId: string, from?: Date, to?: Date) {
    await connectToDatabase();
    const query: any = { club: clubId };
    if (from || to) {
      query.timeIn = {};
      if (from) query.timeIn.$gte = from;
      if (to) query.timeIn.$lte = to;
    }
    return AttendanceModel.find(query);
  }

  async createMembershipRequest(userId: string, clubId: string) {
    await connectToDatabase();
    return MembershipRequestModel.create({ user: userId, club: clubId });
  }

  async getPendingMembershipRequests(clubId: string) {
    await connectToDatabase();
    return MembershipRequestModel.find({ club: clubId, status: 'pending' });
  }

  async decideMembershipRequest(requestId: string, status: 'accepted' | 'rejected', decidedBy: string, reason?: string) {
    await connectToDatabase();
    return MembershipRequestModel.findByIdAndUpdate(
      requestId,
      { status, decidedBy, decidedAt: new Date(), reason },
      { new: true }
    );
  }
}
