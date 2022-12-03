const express = require('express')
// const { FieldValue } = require('firebase-admin/firestore')
// const { collection, query, where, getDocs, doc, setDoc } = require("firebase/firestore");
const app = express()
const port = process.env.PORT || 8383 // process.env.PORT указывается для heroku
const { v4: UUID } = require('uuid')
const { db } = require('./firebase.js')

app.use(express.json())
/* 
const friends = {
  'james': 'friend',
  'larry': 'friend',
  'lucy': 'friend',
  'banana': 'enemy',
}
*/

/* 
// OLD - may be userful
app.get('/users__old', async (req, res) => {
  const peopleRef = db.collection('users').doc('list')
  const doc = await peopleRef.get()
  if (!doc.exists) {
    return res.sendStatus(400)
  }

  res.status(200).send(doc.data())
})
 */

app.get('/users', async (req, res) => {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();
  if (snapshot.empty) {
    return res.sendStatus(400)
  }
  const resultData = [];
  /*   
    snapshot.forEach(doc => {
      resultData.push(doc);
    });
     */
  snapshot.forEach(doc => {
    const { _fieldsProto } = doc;
    const keys = Object.keys(_fieldsProto);
    const user = {};
    keys.forEach(key => {
      // const valueKey = (key === 'integerValue') ? 'integerValue' : 'stringValue';
      const obj = _fieldsProto[key];
      const { valueType } = obj;
      user[key] = obj[valueType]
      // user[key] = _fieldsProto[key].valueType
    })

    resultData.push(user);
  });

  res.status(200).send(resultData)
})
/*
{
"age": 100,
"country": "Ireland",
"email": "oldman@mail.com",
"id": "51778ab7-4b54-4806-8342-918cc8f58105"
"login": "oldman"
}
*/

/* 
// OLD - may be userful
app.get('/friends/:name', (req, res) => {
  const { name } = req.params
  if (!name || !(name in friends)) {
    return res.sendStatus(404)
  }
  res.status(200).send({ [name]: friends[name] })
})
 */

app.post('/add-user', async (req, res) => {
  const { login, email, country, age } = req.body
  const userId = UUID();
  const usersRef = db.collection('users').doc(userId)

  const res2 = await usersRef.set({
    id: userId,
    login,
    email,
    country,
    age,
  }, { merge: true })
  // friends[name] = status
  res.status(200).send('Полователь успешно создан')
})

app.patch('/edit-user', async (req, res) => {
  const { login, email, country, age, id } = req.body;

  const usersRef = db.collection('users').doc(id)
  const res2 = await usersRef.set({
    id,
    login,
    email,
    country,
    age,
  }, { merge: true })
  // friends[name] = newStatus
  res.status(200).send('Полователь успешно отредактирован')
})

app.delete('/delete-user', async (req, res) => {
  const { id } = req.body
  const deleteResult = await db.collection('users').doc(id).delete();

  res.status(200).send('Пользователь успешно удалён')
})

app.listen(port, () => console.log(`Server has started on port: ${port}`))

module.exports = app