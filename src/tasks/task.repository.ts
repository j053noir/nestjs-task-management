import { Inject, Injectable } from '@nestjs/common';
import { ObjectNotFoundError } from '../utils/ObjectNotFound.error';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './DTOs/create-task.dto';
import { GetTasksFilterDto } from './DTOs/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './DTOs/update-task-status.dto';
import { UpdateTaskDto } from './DTOs/update-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(@Inject('DATA_SOURCE') private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  public async getTasks(
    user: User,
    filterDto?: GetTasksFilterDto,
  ): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.createQueryBuilder('task').where(
      'task.isDeleted = false',
    );

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      const term = search.toLocaleLowerCase();
      query.andWhere(
        '(LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search)',
        { search: `%${term}%` },
      );
    }

    query.andWhere({ user });

    return await query.getMany();
  }

  public async getTaskById(id: string, user: User): Promise<Task> {
    const task = await this.findOneBy({ id, user });

    if (!task) throw new ObjectNotFoundError('Task not found');

    return task;
  }

  public async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    return await this.save(task);
  }

  public async deleteTask(
    id: string,
    user: User,
    soft_delete?: boolean,
  ): Promise<Task> {
    const task = await this.findOneBy({ id, user });

    if (!task) throw new ObjectNotFoundError('Task not found');

    if (soft_delete) {
      task.isDeleted = true;
      return await this.save(task);
    } else {
      return await this.remove(task);
    }
  }

  public async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOneBy({ id, user });

    if (!task) throw new ObjectNotFoundError('Task not found');

    task.status = updateTaskStatusDto.status;

    return await this.save(task);
  }

  public async updateTask(
    id: string,
    updateTask: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const task = await this.findOneBy({ id, user });

    if (!task) throw new ObjectNotFoundError('Task not found');

    task.title = updateTask.title;
    task.description = updateTask.description;
    task.status = updateTask.status;
    task.isDeleted = updateTask.isDeleted;

    return this.save(task);
  }
}
