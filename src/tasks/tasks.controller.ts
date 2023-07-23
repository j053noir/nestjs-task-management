import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { CreateTaskDto } from './DTOs/create-task.dto';
import { GetTasksFilterDto } from './DTOs/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './DTOs/update-task-status.dto';
import { UpdateTaskDto } from './DTOs/update-task.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@UseGuards(AuthGuard())
@Controller('tasks')
export class TasksController {
  private logger = new Logger('TaskController');

  constructor(private tasksService: TasksService) {}

  @Get('statuses')
  getTaskStatuses(): string[] {
    this.logger.verbose('GET retrieving all task statuses');
    return this.tasksService.getAllTaskStatuses();
  }

  @Get()
  getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `GET ${user.id} retrieving tasks. Filters: ${JSON.stringify(filterDto)}`,
    );
    return this.tasksService.getTasks(user, filterDto);
  }

  @Get('/:id')
  getTask(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(`GET ${user.id} retrieving tasks with id ${id}`);
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `POST ${user.id} creating task with parameters ${JSON.stringify(
        createTaskDto,
      )}`,
    );
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  deleteTask(
    @Param('id') id: string,
    @GetUser() user: User,
    @Query('soft-delete') soft_delete?: boolean,
  ): Promise<Task> {
    this.logger.verbose(
      `DELETE ${user.id} deleting task with id ${id}. Soft delete: ${soft_delete}`,
    );
    return this.tasksService.deleteTask(id, user, soft_delete);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `PATCH ${user.id} updating task status with parameters ${JSON.stringify(
        updateTaskStatusDto,
      )}`,
    );
    return this.tasksService.updateTaskStatus(id, updateTaskStatusDto, user);
  }

  @Put('/:id')
  updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `PUT ${user.id} updating task with parameters ${JSON.stringify(
        updateTaskDto,
      )}`,
    );
    return this.tasksService.updateTask(id, updateTaskDto, user);
  }
}
