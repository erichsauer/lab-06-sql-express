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
          'id': 6,
          'name': 'Yuzie (Rare Form)',
          'image': 'yuzie-pollination-form.jpg',
          'description': 'Note the squiggle tips used to attract a pollination partner.',
          'fragrant': false,
          'price': 10,
          'category': 'annual',
          'category_id': 1,
          'owner_id': 1
        },
        {
          'id': 2,
          'name': 'Cragged Fallpop',
          'image': 'cragged-fallpop.jpg',
          'description': 'Generally appear in woodland settings among forest duff.',
          'fragrant': false,
          'price': 15,
          'category': 'annual',
          'category_id': 1,
          'owner_id': 1
        },
        {
          'id': 1,
          'name': 'Crested Fluffel',
          'image': 'crested-fluffel.jpg',
          'description': 'Very rare fruiting body with feather-like pollination whisps.',
          'fragrant': true,
          'price': 10,
          'category': 'annual',
          'category_id': 1,
          'owner_id': 1
        },
        {
          'id': 5,
          'name': 'Topsy Swayer',
          'image': 'topsy-swayer.jpg',
          'description': 'Almost impossible to find in nature; they thrive in a controlled environment.',
          'fragrant': false,
          'price': 10,
          'category': 'perennial',
          'category_id': 2,
          'owner_id': 1
        },
        {
          'id': 4,
          'name': 'Spring Zipsies',
          'image': 'spring-zipsies.jpg',
          'description': 'Small colonies often appear in lawns near Garden Gnomes.',
          'fragrant': true,
          'price': 20,
          'category': 'ephimeral',
          'category_id': 3,
          'owner_id': 1
        },
        {
          'id': 3,
          'name': 'Fluted Yodel',
          'image': 'fluted-yodel.jpg',
          'description': 'The Crested Fluffel ',
          'fragrant': true,
          'price': 10,
          'category': 'ephimeral',
          'category_id': 3,
          'owner_id': 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/plants')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns all categories', async() => {

      const expectation = [
        {
          'id': 1,
          'name': 'annual'
        },
        {
          'id': 2,
          'name': 'perennial'
        },
        {
          'id': 3,
          'name': 'ephimeral'
        }
      ];

      const data = await fakeRequest(app)
        .get('/categories')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('returns one plant with id of 2', async() => {

      const expectation =
      {
        'id': 2,
        'name': 'Cragged Fallpop',
        'image': 'cragged-fallpop.jpg',
        'description': 'Generally appear in woodland settings among forest duff.',
        'fragrant': false,
        'price': 15,
        'category': 'annual',
        'category_id': 1,
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .get('/plants/2')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('updates an existing plant in the table', async() => {

      const updatedPlant =
      {
        'name': 'Crested Fluffel Updated',
        'image': 'crested-fluffel.jpg',
        'description': 'Very rare fruiting body with feather-like pollination whisps.',
        'fragrant': false,
        'category_id': 2,
        'price': 10,
      };

      const expectedPlant = {
        'id': 1,
        'name': 'Crested Fluffel Updated',
        'image': 'crested-fluffel.jpg',
        'description': 'Very rare fruiting body with feather-like pollination whisps.',
        'fragrant': false,
        'price': 10,
        'category': 'perennial',
        'category_id': 2,
        'owner_id': 1
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

    test('posts a new plant & that plant is in the plant table', async() => {

      const newPlant =
      {
        'name': 'Pom Puffer Collection',
        'image': 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.daz3d.com%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fimage%2F9df78eab33525d08d6e5fb8d27136e95%2F0%2F7%2F07_alienplants_popup.jpg&f=1&nofb=1',
        'description': 'The best of off-world flora!',
        'fragrant': true,
        'price': 55,
        'category_id': 1,
      };

      const expectedPlant = {
        'id': 7,
        'name': 'Pom Puffer Collection',
        'image': 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.daz3d.com%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fimage%2F9df78eab33525d08d6e5fb8d27136e95%2F0%2F7%2F07_alienplants_popup.jpg&f=1&nofb=1',
        'description': 'The best of off-world flora!',
        'fragrant': true,
        'price': 55,
        'category': 'annual',
        'category_id': 1,
        'owner_id': 1
      };

      await fakeRequest(app)
        .post('/plants')
        .send(newPlant)
        .expect('Content-Type', /json/)
        .expect(200);
      
      const data = await fakeRequest(app)
        .get('/plants/7')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectedPlant);
    });

    test('deletes a single plant with matching ID from the table', async() => {

      const deletedPlant =
      {
        'id': 7,
        'name': 'Pom Puffer Collection',
        'image': 'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.daz3d.com%2Fmedia%2Fcatalog%2Fproduct%2Fcache%2F1%2Fimage%2F9df78eab33525d08d6e5fb8d27136e95%2F0%2F7%2F07_alienplants_popup.jpg&f=1&nofb=1',
        'description': 'The best of off-world flora!',
        'fragrant': true,
        'price': 55,
        'category_id': 1,
        'owner_id': 1
      };

      const data = await fakeRequest(app)
        .delete('/plants/7')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(deletedPlant);

      const noPlantHere = await fakeRequest(app)
        .get('/plants/7')
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
        'price': 15,
        'category_id': 1,
        'owner_id': 1
      };

      const missingKey =
      {
        'id': 2,
        'image': 'cragged-fallpop.jpg',
        'description': 'Generally appear in woodland settings among forest duff.',
        'fragrant': false,
        'price': 15,
        'category': 'annual',
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

