import { Inject, Injectable } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common/exceptions';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './DTOs/create-task.dto';
import { GetTasksFilterDto } from './DTOs/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './DTOs/update-task-status.dto';
import { UpdateTaskDto } from './DTOs/update-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @Inject('TASK_REPOSITORY') private taskRepository: Repository<Task>,
  ) {}

  public getAllTaskStatuses(): string[] {
    return Object.values(TaskStatus);
  }

  public async getTasks(filterDto?: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.isDeleted = false');

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    if (search) {
      const term = search.toLocaleLowerCase();
      query.andWhere(
        'LOWER(task.title) LIKE :search OR LOWER(task.description) LIKE :search',
        { search: `%${term}%` },
      );
    }

    return query.getMany();
  }

  public async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) this.throwNotFoundException(id);

    return task;
  }

  public async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });

    return await this.taskRepository.save(task);
  }

  public async deleteTask(id: string, soft_delete: boolean): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) this.throwNotFoundException(id);

    if (soft_delete) {
      task.isDeleted = true;
      return await this.taskRepository.save(task);
    } else {
      return await this.taskRepository.remove(task);
    }
  }

  public async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) this.throwNotFoundException(id);

    task.status = updateTaskStatusDto.status;

    return await this.taskRepository.save(task);
  }

  public async updateTask(
    id: string,
    updateTask: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.taskRepository.findOneBy({ id });

    if (!task) this.throwNotFoundException(id);

    task.title = updateTask.title;
    task.description = updateTask.description;

    return this.taskRepository.save(task);
  }

  private throwNotFoundException(id: string): void {
    throw new NotFoundException(`Task with ID "${id}" not found`);
  }
}
