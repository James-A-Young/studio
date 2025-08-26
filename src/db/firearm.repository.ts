import { connectToDatabase } from './mongo';
import { FirearmModel, IFirearm } from './firearm.model';
import { Types } from 'mongoose';

export class FirearmRepository {
  async createFirearm(data: Partial<IFirearm>) {
    await connectToDatabase();
    return FirearmModel.create(data);
  }

  async getFirearmById(id: string) {
    await connectToDatabase();
    return FirearmModel.findById(id);
  }

  async getFirearmsByUser(userId: string) {
    await connectToDatabase();
    return FirearmModel.find({ ownerUser: userId });
  }

  async getFirearmsByClub(clubId: string) {
    await connectToDatabase();
    return FirearmModel.find({ ownerClub: clubId });
  }

  async updateFirearm(id: string, data: Partial<IFirearm>) {
    await connectToDatabase();
    return FirearmModel.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteFirearm(id: string) {
    await connectToDatabase();
    return FirearmModel.findByIdAndDelete(id);
  }

  async listAllFirearms() {
    await connectToDatabase();
    return FirearmModel.find();
  }
}
