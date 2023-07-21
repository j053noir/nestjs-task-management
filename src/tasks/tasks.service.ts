import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v4 as uuid } from 'uuid';
import { CreateTaskDto } from './DTOs/create-task.dto';
import { UpdateStatusDto } from './DTOs/update-task-status.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  public getAllTasks(): Task[] {
    return this.tasks;
  }

  public getTaskById(id: string): Task {
    return this.tasks.find((task) => task.id === id);
  }

  public createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;

    const task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);

    return task;
  }

  public deleteTask(id: string): Task {
    const taskIndex = this.findTaskIndex(id);

    if (taskIndex < 0) return null;

    const task = this.tasks.splice(taskIndex, 1)[0];
    task.id = '';

    return task;
  }

  updateTaskStatus(id: string, updateTaskStatusDto: UpdateStatusDto): Task {
    const taskIndex = this.findTaskIndex(id);

    if (taskIndex < 0) return null;

    this.tasks[taskIndex].status = updateTaskStatusDto.status;

    return this.tasks[taskIndex];
  }

  private findTaskIndex(id: string): number {
    return this.tasks.findIndex((task) => task.id === id);
  }
}
