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
  });
});
