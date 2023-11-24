import React from 'react';
import ProductRegistration from '../hooks/ProductRegistration';
import CheckVote from '../hooks/CheckVote';
import { useTasks } from "../hooks/useTask";
import { mode } from "../constants/modeConstants";

function Creater({ address, provider }) {
    const [tasks, loading] = useTasks(address, mode.ALL);

    return (
        <div className="nft-list">

            {loading ? (
                <p>Loading NFTs...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>名前</th>
                            <th>説明</th>
                            <th>報酬</th>
                            <th>作成日</th>
                            <th>終了日</th>
                            <th>リンク</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map(task => (
                            <tr key={task.id}>
                                <td>{task.name}</td>
                                <td>{task.description}</td>
                                <td>{task.reward}</td>
                                <td>{task.created_time}</td>
                                <td>{task.end_time}</td>
                                <td>
                                    <ProductRegistration contest={task} />
                                    {/* <CheckVote task={task} /> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default Creater;
