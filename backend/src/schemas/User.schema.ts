import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop()
  userId: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  emailAddress: string;

  @Prop()
  password: string;

  @Prop({ required: true, unique: true })
  organization: string;

  @Prop()
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
