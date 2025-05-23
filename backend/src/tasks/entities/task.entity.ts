import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Generated,
} from 'typeorm';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Generated('uuid')
  taskId: string;

  @Column()
  task: string;

  @Column({ nullable: true })
  assignee: string;

  @Column()
  organizationId: string;

  @Column()
  priority: string;

  @Column()
  status: string;

  @Column()
  dueDate: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
