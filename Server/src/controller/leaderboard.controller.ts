import { Request, Response } from 'express';
import * as statusCodes from 'http-status';
import { leaderboard } from '../models/leaderboard.model';
import { User } from '../models/user.model';
import { ResponseBuilder } from '../utils/response.builder';

/* eslint-disable @typescript-eslint/no-explicit-any */
export const getLeaderboard = async (req: Request, res: Response) => { 
    try {
        // Extract user information from request headers
        const userObject = JSON.parse(req.headers['user'] as string);
        const user = await User.findOne({ email: userObject.email });
        console.log(user);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get the entire leaderboard sorted by total_sessions in descending order
        const allLeaderBoard = await leaderboard.aggregate([
            {
                $lookup: {
                    from: 'users', // name of the users collection
                    localField: 'user_id', // field in leaderboard collection
                    foreignField: '_id', // field in users collection
                    as: 'userDetails' // name of the array field to add user details
                }
            },
            {
                $unwind: '$userDetails' // flatten the userDetails array
            },
            {
                $sort: { total_sessions: -1 } // sort by total_sessions in descending order
            }
        ]);

            //By using populate method
            //         const allLeaderBoard = await Leaderboard.find()
            //   .populate('user_id')
            //   .sort({ total_sessions: -1 })
            //   .exec();

        // Add rank to each entry
        const leaderboardWithRanks = allLeaderBoard.map((entry, index) => ({
            user_id: entry.user_id,
            total_sessions: entry.total_sessions,
            rank: index + 1,
            userDetails: {
                email: entry.userDetails.email
            }
        }));

        const topThreeRankers = leaderboardWithRanks.slice(0,3); 

        const otherRankers = leaderboardWithRanks.slice(2);
        // Find the user's rank
        const userRank = leaderboardWithRanks.find(entry => entry.user_id.toString() === user._id.toString());
        // Respond with the user's rank and the entire leaderboard 
        const response = ResponseBuilder({ userRank: userRank, leaderboard: otherRankers, topThreeRankers }, statusCodes.OK)
        res.status(200).send(response);
    } catch(err:any) {
        return res.status(statusCodes.BAD_REQUEST).json({ message: err.message });
    }
}