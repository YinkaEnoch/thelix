import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    try {
      return await this.taskRepository.save(createTaskDto);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error ?? 'Failed to create task');
    }
  }

  async findAll(organizationId: string) {
    try {
      return await this.taskRepository.findBy({ organizationId });
    } catch (error) {
      throw new BadRequestException(error ?? `Failed to get tasks`);
    }
  }

  async findOne(taskId: string) {
    try {
      const task = await this.taskRepository.findOneBy({ taskId });

      if (!task) throw new NotFoundException(`Task (${taskId}) not found`);

      return task;
    } catch (error) {
      throw new BadRequestException(error ?? `Failed to get task (${taskId})`);
    }
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto) {
    try {
      const task = await this.taskRepository.findOneBy({ taskId });

      if (!task) throw new NotFoundException(`Task (${taskId}) not found`);

      return await this.taskRepository.update({ taskId }, updateTaskDto);
    } catch (error) {
      throw new BadRequestException(error ?? 'Failed to update task');
    }
  }

  async remove(taskId: string) {
    try {
      const task = await this.taskRepository.findOneBy({ taskId });

      if (!task) throw new NotFoundException(`Task (${taskId}) not found`);

      return await this.taskRepository.delete({ taskId });
    } catch (error) {
      throw new BadRequestException(error ?? 'Failed to delete task');
    }
  }
}
