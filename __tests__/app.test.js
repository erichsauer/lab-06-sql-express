require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns all plants', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'Crested Fluffel',
          'image': 'crested-fluffel.jpg',
          'description': 'Very rare fruiting body with feather-like pollination whisps.',
          'fragrant': true,
          'category': 'annual',
          'price': 10,
          'owner_id': 1
        },
        {
          'id': 2,
          'name': 'Cragged Fallpop',
          'image': 'cragged-fallpop.jpg',
          'description': 'Generally appear in woodland settings among forest duff.',
          'fragrant': false,
          'category': 'annual',
          'price': 15,
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'Fluted Yodel',
          'image': 'fluted-yodel.jpg',
          'description': 'The Crested Fluffel ',
          'fragrant': true,
          'category': 'ephimeral',
          'price': 10,
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Spring Zipsies',
          'image': 'spring-zipsies.jpg',
          'description': 'Small colonies often appear in lawns near Garden Gnomes.',
          'fragrant': true,
          'category': 'ephimeral',
          'price': 20,
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'Topsy Swayer',
          'image': 'topsy-swayer.jpg',
          'description': 'Almost impossible to find in nature; they thrive in a controlled environment.',
          'fragrant': false,
          'category': 'perennial',
          'price': 10,
          'owner_id': 1
        },
        {
          'id': 6,
          'name': 'Yuzie (Rare Form)',
          'image': 'yuzie-pollination-form.jpg',
          'description': 'Note the squiggle tips used to attract a pollination partner.',
          'fragrant': false,
          'category': 'annual',
          'price': 10,
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/plants')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns all plants', async() => {

      const expectation =
      {
        'id': 2,
        'name': 'Cragged Fallpop',
        'image': 'cragged-fallpop.jpg',
        'description': 'Generally appear in woodland settings among forest duff.',
        'fragrant': false,
        'category': 'annual',
        'price': 15,
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .get('/plants/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('posts a new plant & that plant is in the plant table', async() => {

      const newPlant =
      {
        'name': 'Pom Puffer Collection',
        'image': 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.daz3d.com%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fimage%2F9df78eab33525d08d6e5fb8d27136e95%2F0%2F7%2F07_alienplants_popup.jpg&f=1&nofb=1',
        'description': 'The best of off-world flora!',
        'fragrant': true,
        'category': 'cosmic',
        'price': 55,
        'owner_id': 1
      };

      const expectedPlant = {
        ...newPlant,
        id: 7,
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .post('/plants')
        .send(newPlant)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedPlant);
    });

    test('updates an existing plant in the table', async() => {

      const updatedPlant =
      {
        'id': 1,
        'name': 'Crested Fluffel Updated',
        'image': 'crested-fluffel.jpg',
        'description': 'Very rare fruiting body with feather-like pollination whisps.',
        'fragrant': false,
        'category': 'annual',
        'price': 10,
        'owner_id': 1
      };

      const expectedPlant = {
        ...updatedPlant,
        id: 1,
        owner_id: 1,
      };

      await fakeRequest(app)
        .put('/plants/1')
        .send(updatedPlant)
        .expect('Content-Type', /json/)
        .expect(200);
        
      const updatedPlantData = await fakeRequest(app)
        .get('/plants/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updatedPlantData.body).toEqual(expectedPlant);
    });

    test('deletes a single plant with matching ID from the table', async() => {

      const deletedPlant =
      {
        'id': 1,
        'name': 'Crested Fluffel Updated',
        'image': 'crested-fluffel.jpg',
        'description': 'Very rare fruiting body with feather-like pollination whisps.',
        'fragrant': false,
        'category': 'annual',
        'price': 10,
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .delete('/plants/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(deletedPlant);

      const noPlantHere = await fakeRequest(app)
        .get('/plants/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(noPlantHere.body).toEqual('');
    });

    test('404 error when no id is specified for delete or put', async() => {

      const deleteError = await fakeRequest(app)
        .delete('/plants/')
        .expect('Content-Type', /html/)
        .expect(404);
      
      expect(deleteError.body).toEqual({});

      const putError = await fakeRequest(app)
        .put('/plants/')
        .expect('Content-Type', /html/)
        .expect(404);
      
      expect(putError.body).toEqual({});
    });

    test('500 error when key is misspelled or missing', async() => {

      const misspelledKey =
      {
        'id': 2,
        'names': 'Cragged Fallpop',
        'image': 'cragged-fallpop.jpg',
        'description': 'Generally appear in woodland settings among forest duff.',
        'fragrant': false,
        'category': 'annual',
        'price': 15,
        'owner_id': 1
      };

      const missingKey =
      {
        'id': 2,
        'image': 'cragged-fallpop.jpg',
        'description': 'Generally appear in woodland settings among forest duff.',
        'fragrant': false,
        'category': 'annual',
        'price': 15,
        'owner_id': 1
      };

      const error = {
        'error': 'null value in column "name" of relation "plants" violates not-null constraint'
      };

      const misspelledKeyError = await fakeRequest(app)
        .put('/plants/2')
        .send(misspelledKey)
        .expect('Content-Type', /json/)
        .expect(500);
        
      expect(misspelledKeyError.body).toEqual(error);

      const missingKeyError = await fakeRequest(app)
        .put('/plants/2')
        .send(missingKey)
        .expect('Content-Type', /json/)
        .expect(500);
        
      expect(missingKeyError.body).toEqual(error);
    });
  });
});

