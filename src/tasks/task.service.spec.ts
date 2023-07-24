import { faker } from '@faker-js/faker/locale/en';
import { Test } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { TasksService } from './tasks.service';

const mockUser: User = {
  id: faker.string.uuid(),
  isActive: true,
  password: faker.internet.password(),
  tasks: [],
  username: faker.internet.userName(),
};

const mockTask: Task = {
  id: faker.string.uuid(),
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  status: faker.helpers.enumValue(TaskStatus),
  isDeleted: faker.datatype.boolean(),
  user: mockUser,
};

const mockTasksRepository = () => ({
  getTasks: jest.fn(),
  getTaskById: jest.fn(),
  createTask: jest.fn(),
  deleteTask: jest.fn(),
  updateTaskStatus: jest.fn(),
  updateTask: jest.fn(),
});

describe('TaskService', () => {
  let taskRepository: any;
  let taskService: TasksService;

  beforeEach(async () => {
    // Initialize taskSercie and taskRepository
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTasksRepository,
        },
      ],
    }).compile();

    taskRepository = module.get(TaskRepository);
    taskService = module.get(TasksService);
  });

  it('should be defined', () => {
    expect(taskRepository).toBeDefined();
    expect(taskService).toBeDefined();
  });

  describe('getAllTaskStatuses', () => {
    it('return array of all task statuses', () => {
      const result = taskService.getAllTaskStatuses();
      expect(result).toEqual(Object.values(TaskStatus));
    });
  });

  describe('getTasks', () => {
    it('call TaskRepository.getTasks() and return empty array', async () => {
      taskRepository.getTasks.mockResolvedValue([]);
      const result = await taskService.getTasks(mockUser, {});
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getTaskById', () => {
    it('call TaskRepository.getTaskById() and return empty object', async () => {
      taskRepository.getTaskById.mockResolvedValue(mockTask);
      const result = await taskService.getTaskById(mockTask.id, mockUser);
      expect(taskRepository.getTaskById).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('createTask', () => {
    it('call TaskRepository.createTask() and return task', async () => {
      taskRepository.createTask.mockResolvedValue(mockTask);
      const result = await taskService.createTask(
        {
          description: mockTask.description,
          title: mockTask.title,
        },
        mockUser,
      );
      expect(taskRepository.createTask).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('call TaskRepository.deleteTask() with soft_delete as true and return task', async () => {
      const soft_delete = true;
      mockTask.isDeleted = soft_delete;
      taskRepository.deleteTask.mockResolvedValue({
        ...mockTask,
        isDeleted: soft_delete,
      });
      const result = await taskService.deleteTask(
        mockTask.id,
        mockUser,
        soft_delete,
      );
      expect(taskRepository.deleteTask).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('call TaskRepository.deleteTask() with soft_delete as false and return task', async () => {
      const soft_delete = false;
      mockTask.isDeleted = soft_delete;
      taskRepository.deleteTask.mockResolvedValue({
        ...mockTask,
        isDeleted: soft_delete,
      });
      const result = await taskService.deleteTask(
        mockTask.id,
        mockUser,
        soft_delete,
      );
      expect(taskRepository.deleteTask).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTaskStatus', () => {
    it('call TaskRepository.updateTaskStatus() and return task', async () => {
      const mockStatus = faker.helpers.enumValue(TaskStatus);
      mockTask.status = mockStatus;
      taskRepository.updateTaskStatus.mockResolvedValue({
        ...mockTask,
        status: mockStatus,
      });
      const result = await taskService.updateTaskStatus(
        mockTask.id,
        { status: mockStatus },
        mockUser,
      );
      expect(taskRepository.updateTaskStatus).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('call TaskRepository.updateTask() and return task', async () => {
      taskRepository.updateTask.mockResolvedValue(mockTask);
      const result = await taskService.updateTask(
        mockTask.id,
        {
          title: mockTask.title,
          description: mockTask.description,
          status: mockTask.status,
          isDeleted: mockTask.isDeleted,
        },
        mockUser,
      );
      expect(taskRepository.updateTask).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });
  });
});
