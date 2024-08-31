
import React, { useState } from 'react';

import axios from 'axios';



function Signup() {

  const [firstName, setFirstName] = useState('');

  const [lastName, setLastName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post('http://localhost:3000/signup', { firstName, lastName, email, password });

      alert('Signup successful');

    } catch (error) {

      alert('Error: ' + error.response.data.message);

    }

  };



  return (

    <form onSubmit={handleSubmit}>

      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" required />

      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" required />

      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />

      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />

      <button type="submit">Sign Up</button>

    </form>

  );

}



export default Signup;

