const client = require('../lib/client');
// import our seed data:
const plantsData = require('./plants.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      categoriesData.map(category => {
        return client.query(`
                      INSERT INTO categories (name)
                      VALUES ($1)
                      RETURNING *;
                  `,
        [category.name]);
      })
    );
      
    await Promise.all(
      plantsData.map(plant => {
        return client.query(`
                    INSERT INTO plants (name, image, description, fragrant, price, category_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [plant.name, plant.image, plant.description, plant.fragrant, plant.price, plant.category_id, user.id]);
      })
    );
    
    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
