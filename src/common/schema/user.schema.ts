import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
