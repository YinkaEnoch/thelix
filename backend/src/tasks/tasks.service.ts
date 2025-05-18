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

  async findAll(organizationId: string, queryObj: Record<string, string>) {
    try {
      const statusQuery = 'AND t.status = ?';
      const priorityQuery = 'AND t.priority = ?';
      const assigneeQuery = 'AND t.assignee = ?';
      const dueDateQuery = 'AND t.dueDate = ?';

      const queryParameters = [organizationId];

      let sqlQuery = `SELECT t.taskId, t.task, t.assignee,
        t.organizationId, t.priority, t.status,
        t.dueDate, u.firstName, u.lastName,
        u.emailAddress, u.role
        FROM task t
        LEFT JOIN user u
        ON t.assignee = u.userId
        WHERE t.organizationId = ?`;

      if (queryObj.status) {
        sqlQuery += ' ' + statusQuery;
        queryParameters.push(queryObj.status);
      }

      if (queryObj.priority) {
        sqlQuery += ' ' + priorityQuery;
        queryParameters.push(queryObj.priority);
      }

      if (queryObj.assignee) {
        sqlQuery += ' ' + assigneeQuery;
        queryParameters.push(queryObj.assignee);
      }

      if (queryObj.dueDate) {
        sqlQuery += ' ' + dueDateQuery;
        queryParameters.push(queryObj.dueDate);
      }

      return await this.taskRepository.query(sqlQuery, queryParameters);
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
      console.log(error);
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
