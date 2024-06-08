import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import Chart from 'chart.js/auto';
import './App.css';

const socket = io('http://10.56.104.243:3001');

const App = () => {
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [nickname, setNickname] = useState('');
  const [userStats, setUserStats] = useState({});

  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socket.on('initialComments', (initialComments) => {
      console.log('Received initial comments:', initialComments);
      setComments(initialComments.reverse());
      calculateUserStats(initialComments);
    });

    socket.on('newComment', (newComment) => {
      console.log('Received new comment:', newComment);
      setComments((prevComments) => [newComment, ...prevComments]);
      calculateUserStats([newComment, ...comments]);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('initialComments');
      socket.off('newComment');
      socket.off('connect_error');
    };
  }, [comments]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (comment.trim() && nickname.trim()) {
      console.log('Sending new comment:', comment);
      socket.emit('newComment', `${nickname}: ${comment}`);
      setComment('');
    }
  };

  const calculateUserStats = (comments) => {
    const stats = {};
    comments.forEach((comment) => {
      const [user] = comment.split(':');
      stats[user] = (stats[user] || 0) + 1;
    });
    setUserStats(stats);
  };

  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(userStats),
          datasets: [{
            label: 'User Messages',
            data: Object.values(userStats),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
              'rgba(255, 159, 64, 0.6)'
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
            title: {
              display: true,
              text: 'User Messages Distribution'
            }
          }
        }
      });
    }
  }, [userStats]);

  return (
    <div className="App">
      <h1>Chat</h1>
      <div className="container">
        <div className="form">
          <h2>Add Messages</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your Nickname"
              required
            />
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              required
            />
            <button type="submit">Add Messages</button>
          </form>
        </div>
        <div className="comments-container">
          <h2>Chat</h2>
          <div className="comments">
            {comments.map((comment, index) => (
              <div key={index}>{comment}</div>
            ))}
            <div ref={commentsEndRef}></div>
          </div>
        </div>
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default App;
