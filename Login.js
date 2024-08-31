import React, { useState } from 'react';

import axios from 'axios';



function Login() {

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post('http://localhost:3000/login', { email, password });

      localStorage.setItem('token', response.data.token);

      alert('Login successful');

    } catch (error) {

      alert('Error: ' + error.response.data.message);

    }

  };