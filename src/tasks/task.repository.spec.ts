import { faker } from '@faker-js/faker';
import { Test } from '@nestjs/testing';
import { User } from '../auth/user.entity';
import { DataSource } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TaskRepository } from './task.repository';
import { ObjectNotFoundError } from '../utils/ObjectNotFound.error';
import { UpdateTaskStatusDto } from './DTOs/update-task-status.dto';

const mockUser = (id: string): User => {
  return {
    id,
    isActive: true,
    password: faker.internet.password(),
    tasks: [],
    username: faker.internet.userName(),
  };
};

const mockUsers = faker.helpers.multiple(() => mockUser(faker.string.uuid()), {
  count: 2,
});

const mockTask = (id: string, user: User): Task => {
  return {
    id,
    title: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    status: faker.helpers.enumValue(TaskStatus),
    isDeleted: faker.datatype.boolean(),
    user,
  };
};

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let dataSource: DataSource;
  let mockTasks: Task[];

  beforeAll(async () => {
    // Initialize dataSource and taskRepository
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: 'DATA_SOURCE',
          useFactory: async () => {
            const dataSource = new DataSource({
              type: 'sqlite',
              database: ':memory:',
              dropSchema: true,
              entities: [Task, User],
              synchronize: true,
              logging: false,
            });

            return dataSource.initialize();
          },
        },
        TaskRepository,
      ],
    }).compile();

    taskRepository = module.get(TaskRepository);
    dataSource = module.get('DATA_SOURCE');

    const queryBuilder = dataSource.createQueryBuilder();

    // Insert mock users
    await queryBuilder.insert().into(User).values(mockUsers).execute();

    mockTasks = faker.helpers.multiple(
      () =>
        mockTask(faker.string.uuid(), faker.helpers.arrayElement(mockUsers)),
      {
        count: 5,
      },
    );

    // Insert mock tasks
    await queryBuilder.insert().into(Task).values(mockTasks).execute();
  });

  it('should be defined', () => {
    expect(taskRepository).toBeDefined();
    expect(dataSource).toBeDefined();
  });

  // describe('getAll', () => {
  //   it('with empty filters and return array of all tasks', async () => {
  //     const mock_user = faker.helpers.arrayElement(mockUsers);
  //     const expectedResult = mockTasks.filter(
  //       (x) => x.user.id === mock_user.id,
  //     );
  //     const result = await taskRepository.getTasks(mock_user);
  //     expect(result).toEqual(expectedResult);
  //   });

  //   it('with status and return array of all tasks', async () => {
  //     const status = faker.helpers.enumValue(TaskStatus);
  //     const mock_user = faker.helpers.arrayElement(mockUsers);
  //     const expectedResult = mockTasks.filter(
  //       (x) => x.user.id === mock_user.id && x.status === status,
  //     );
  //     const result = await taskRepository.getTasks(mock_user, { status });
  //     expect(result).toEqual(expectedResult);
  //   });

  //   it('with status and return array of all tasks', async () => {
  //     const search = 'qui';
  //     const mock_user = faker.helpers.arrayElement(mockUsers);
  //     const expectedResult = mockTasks.filter(
  //       (x) =>
  //         x.user.id === mock_user.id &&
  //         x.title.indexOf(search) >= 0 &&
  //         x.description.indexOf(search) >= 0,
  //     );
  //     const result = await taskRepository.getTasks(mock_user, { search });
  //     expect(result).toEqual(expectedResult);
  //   });
  // });

  describe('getTaskById', () => {
    it('task exists, return task', async () => {
      const expectedTask = faker.helpers.arrayElement(mockTasks);
      const result = await taskRepository.getTaskById(
        expectedTask.id,
        expectedTask.user,
      );
      expect(result.id).toEqual(expectedTask.id);
    });

    it('task does not exist, throw ObjectNotFoundError', async () => {
      try {
        await taskRepository.getTaskById(null, null);
      } catch (err) {
        expect(err).toBeInstanceOf(ObjectNotFoundError);
      }
    });
  });

  describe('updateTaskStatus', () => {
    it('task exists, return task with new status', async () => {
      const updateTaskStatus = faker.helpers.arrayElement(mockTasks);
      const status = faker.helpers.enumValue(TaskStatus);
      const dto: UpdateTaskStatusDto = { status };
      const result = await taskRepository.updateTaskStatus(
        updateTaskStatus.id,
        dto,
        updateTaskStatus.user,
      );
      expect(result.status).toEqual(status);
    });

    it('task does not exist, throw ObjectNotFoundError', async () => {
      try {
        await taskRepository.updateTaskStatus('', null, null);
      } catch (err) {
        expect(err).toBeInstanceOf(ObjectNotFoundError);
      }
    });
  });

  describe('updateTask', () => {
    it('task exists, return task', async () => {
      const updateTask = faker.helpers.arrayElement(mockTasks);
      const result = await taskRepository.updateTask(
        updateTask.id,
        { ...updateTask },
        updateTask.user,
      );
      expect(result.id).toEqual(updateTask.id);
    });

    it('task does not exist, throw ObjectNotFoundError', async () => {
      try {
        await taskRepository.updateTask('', null, null);
      } catch (err) {
        expect(err).toBeInstanceOf(ObjectNotFoundError);
      }
    });
  });

  describe('deleteTask', () => {
    it('task exists, with soft_delete flag as true, return task', async () => {
      const deletedTask = faker.helpers.arrayElement(mockTasks);
      const result = await taskRepository.deleteTask(
        deletedTask.id,
        deletedTask.user,
        true,
      );
      expect(result.id).toEqual(deletedTask.id);
      expect(result.isDeleted).toEqual(true);
    });

    it('task exists, with soft_delete flag as false, return task', async () => {
      const deletedTask = faker.helpers.arrayElement(mockTasks);
      const expectedCount = mockTasks.length - 1;
      await taskRepository.deleteTask(deletedTask.id, deletedTask.user, false);
      expect(await taskRepository.count()).toEqual(expectedCount);
    });

    it('task does not exist, throw ObjectNotFoundError', async () => {
      try {
        await taskRepository.deleteTask('', null, null);
      } catch (err) {
        expect(err).toBeInstanceOf(ObjectNotFoundError);
      }
    });
  });
});
