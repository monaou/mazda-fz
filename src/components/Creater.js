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
                            <th>name</th>
                            <th>description</th>
                            <th>reward</th>
                            <th>created_time</th>
                            <th>end_time</th>
                            <th>link</th>
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
                                    <ProductRegistration task_id={task.id} />
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
