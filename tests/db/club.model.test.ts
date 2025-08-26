
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ClubModel, Discipline, Distance } from '../../src/db/club.model';

describe('ClubModel', () => {
  let mongoServer: MongoMemoryServer;
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });
  afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
  });
  afterEach(async () => {
    await ClubModel.deleteMany({});
  });

  it('creates a club with valid address and range', async () => {
    const club = await ClubModel.create({
      name: 'Coverage Club',
      address: {
        address: '1 Test St',
        postcode: 'ZZ99 1ZZ',
        city: 'Testville',
        country: 'UK',
      },
      contactEmail: 'test@club.com',
      disciplines: [Discipline.SMALLRIFLEPRONE],
      ranges: [
        {
          name: 'Indoor Range',
          address: {
            address: '1 Test St',
            postcode: 'ZZ99 1ZZ',
            city: 'Testville',
            country: 'UK',
          },
          disciplines: [Discipline.SMALLRIFLEPRONE],
          distances: [Distance.yrds25],
          firingPoints: 5,
          indoor: true,
        },
      ],
    });
    expect(club.name).toBe('Coverage Club');
    expect(club.address.city).toBe('Testville');
    expect(club.ranges[0].name).toBe('Indoor Range');
  });

  it('fails validation for missing required fields', async () => {
    await expect(ClubModel.create({} as any)).rejects.toThrow();
  });

  it('enforces enum values for disciplines and distances', async () => {
    await expect(
      ClubModel.create({
        name: 'Enum Club',
        address: {
          address: '2 Test St',
          postcode: 'ZZ99 2ZZ',
          city: 'Testville',
          country: 'UK',
        },
        contactEmail: 'enum@club.com',
        disciplines: ['NotARealDiscipline'],
        ranges: [],
      })
    ).rejects.toThrow();
  });

  it('calls geocodeAddress in pre-save hook for club and range', async () => {
    const geoMock = jest.spyOn(require('../../src/lib/geocode'), 'geocodeAddress').mockResolvedValue({ latitude: 1, longitude: 2 });
    const club = await ClubModel.create({
      name: 'Geo Club',
      address: {
        address: '3 Test St',
        postcode: 'ZZ99 3ZZ',
        city: 'Testville',
        country: 'UK',
      },
      contactEmail: 'geo@club.com',
      disciplines: [Discipline.SMALLRIFLEPRONE],
      ranges: [
        {
          name: 'Geo Range',
          address: {
            address: '3 Test St',
            postcode: 'ZZ99 3ZZ',
            city: 'Testville',
            country: 'UK',
          },
          disciplines: [Discipline.SMALLRIFLEPRONE],
          distances: [Distance.yrds25],
          firingPoints: 5,
          indoor: true,
        },
      ],
    });
  expect(geoMock).toHaveBeenCalled();
  expect(club.location).toBeDefined();
  expect(club.location.coordinates).toEqual([2, 1]);
  expect(club.ranges[0].location).toBeDefined();
  expect(club.ranges[0].location.coordinates).toEqual([2, 1]);
  geoMock.mockRestore();
  });

  it('creates the location index', async () => {
    // Ensure indexes are built
    await ClubModel.syncIndexes();

    const indexes = await ClubModel.collection.getIndexes();
    console.log(indexes)
    const hasLocationIndex = Object.values(indexes).some(
    (idx: any) =>
        Array.isArray(idx) &&
        idx.length === 1 &&
        idx[0][0] === 'location' &&
        idx[0][1] === '2dsphere'
    );
    expect(hasLocationIndex).toBe(true);
  });
});
