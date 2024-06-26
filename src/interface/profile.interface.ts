import { Document } from 'mongoose';
export interface IProfile extends Document {
  readonly userId: string;
  readonly imageUrl: string | null;
  readonly name: string;
  readonly birthday: string;
  readonly gender: string;
  readonly horoscope: string;
  readonly zodiac: string;
  readonly height: number;
  readonly weight: number;
  readonly interests: string[];
}
