import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import  { Message } from '../../message/entity/message.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];
}