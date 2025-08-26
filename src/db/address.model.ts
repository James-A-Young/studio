import { Schema } from 'mongoose';

export interface IAddress {
  address: string;
  postcode: string;
  city: string;
  country: string;
}

export const AddressSchema = new Schema<IAddress>({
  address: { type: String, required: true },
  postcode: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

// Helper to check if address fields have changed
export function addressChanged(doc: any) {
  if (!doc.isModified('address')) return false;
  const addr = doc.address || {};
  return (
    doc.isModified('address.address') ||
    doc.isModified('address.postcode') ||
    doc.isModified('address.city') ||
    doc.isModified('address.country')
  );
}