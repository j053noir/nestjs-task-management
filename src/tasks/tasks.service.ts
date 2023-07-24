import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ObjectNotFoundError } from '../utils/ObjectNotFound.error';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './DTOs/create-task.dto';
import { GetTasksFilterDto } from './DTOs/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './DTOs/update-task-status.dto';
import { UpdateTaskDto } from './DTOs/update-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';

@Injectable()
export class TasksService {
  private logger = new Logger('TaskService');

  constructor(private taskRepository: TaskRepository) {}

  public getAllTaskStatuses(): string[] {
    return Object.values(TaskStatus);
  }

  public async getTasks(
    user: User,
    filterDto?: GetTasksFilterDto,
  ): Promise<Task[]> {
    return await this.taskRepository.getTasks(user, filterDto);
  }

  public async getTaskById(id: string, user: User): Promise<Task> {
    let task: Task;

    try {
      task = await this.taskRepository.getTaskById(id, user);
    } catch (err) {
      this.handleError(err, id);
    }

    return task;
  }

  public async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    let task: Task;

    try {
      task = await this.taskRepository.createTask(createTaskDto, user);
    } catch (err) {
      this.handleError(err);
    }

    return task;
  }

  public async deleteTask(
    id: string,
    user: User,
    soft_delete?: boolean,
  ): Promise<Task> {
    let task: Task;

    try {
      task = await this.taskRepository.deleteTask(id, user, soft_delete);
    } catch (err) {
      this.handleError(err, id);
    }

    return task;
  }

  public async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User,
  ): Promise<Task> {
    let task: Task;

    try {
      task = await this.taskRepository.updateTaskStatus(
        id,
        updateTaskStatusDto,
        user,
      );
    } catch (err) {
      this.handleError(err, id);
    }

    return task;
  }

  public async updateTask(
    id: string,
    updateTask: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    let task: Task;

    try {
      task = await this.taskRepository.updateTask(id, updateTask, user);
    } catch (err) {
      this.handleError(err, id);
    }

    return task;
  }

  private handleError(err: Error, taskId?: string): void {
    if (err instanceof ObjectNotFoundError) this.throwNotFoundException(taskId);
    else {
      this.logger.error(err.message, err.stack);
      throw new InternalServerErrorException();
    }
  }

  private throwNotFoundException(taskId: string): void {
    throw new NotFoundException(`Task with ID "${taskId}" not found`);
  }
}
