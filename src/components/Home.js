// Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to MazdaFanZone</h1>
            <div className="info-card">
                <p>Supported Chain: <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer">Polygon Munbai</a></p>
                <p>Payments: <a href="https://usdcfaucet.com/" target="_blank" rel="noopener noreferrer">USDC</a></p>
            </div>

            <div className="feature-cards">
                <div className="feature-card">
                    <Link to="/organizer" className="feature-title-link">
                        <h2>開催</h2>
                    </Link>
                    <p>コンテストの開催ができます</p>
                </div>

                <div className="feature-card">
                    <Link to="/creater" className="feature-title-link">
                        <h2>開発</h2>
                    </Link>
                    <p>プロダクトの提出ができます</p>
                </div>

                <div className="feature-card">
                    <Link to="/voter" className="feature-title-link">
                        <h2>投票</h2>
                    </Link>
                    <p>好きなプロダクトに投票できます.</p>
                </div>

                <div className="feature-card">
                    <Link to="/reward" className="feature-title-link">
                        <h2>報酬</h2>
                    </Link>
                    <p>投票結果に応じた報酬を取得できます</p>
                </div>
            </div>
        </div>
    );
}

export default Home;
