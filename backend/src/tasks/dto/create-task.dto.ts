import { IsString, IsUUID, Length, IsEnum, IsOptional } from 'class-validator';
import { TaskPriority, TaskStatus } from 'src/enums/task.enum';

export class CreateTaskDto {
  @IsString()
  @Length(2, 200)
  task: string;

  @IsString()
  @IsOptional()
  assignee: string;

  @IsString()
  @IsUUID()
  organizationId: string;

  @IsEnum(TaskPriority)
  priority: string;

  @IsEnum(TaskStatus)
  status: string;

  @IsString()
  dueDate: string;
}
