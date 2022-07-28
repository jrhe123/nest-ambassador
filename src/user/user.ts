import { Exclude } from 'class-transformer';
import { Link } from 'src/link/link';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Column({ default: true })
  is_ambassador: boolean;

  @OneToMany(() => Link, (link) => link.user)
  links: Link[];
}
