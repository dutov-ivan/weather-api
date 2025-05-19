import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  city: string;

  @Column()
  frequency: string;

  @Column()
  confirmed: boolean;

  @Column()
  confirmationCode?: string;

  @Column({ nullable: true })
  lastSentAt?: Date;
}
