const crypto = require('crypto');

class CTFService {
  constructor() {
    this.challenges = new Map();
    this.submissions = new Map();
    this.leaderboard = new Map();
    this.initializeChallenges();
  }

  // Initialize default challenges
  initializeChallenges() {
    const defaultChallenges = [
      {
        id: 1,
        title: "Simple XOR",
        description: "Decrypt the message using XOR with key 'SECRET'",
        category: "cryptography",
        difficulty: "easy",
        points: 100,
        flag: "FLAG{x0r_1s_fun}",
        hints: ["XOR is reversible", "Try different keys"],
        solvedBy: new Set()
      },
      {
        id: 2,
        title: "SQL Injection",
        description: "Find the admin password in the database",
        category: "web",
        difficulty: "medium",
        points: 200,
        flag: "FLAG{sql_m4st3r}",
        hints: ["Try UNION SELECT", "Check the users table"],
        solvedBy: new Set()
      }
    ];

    defaultChallenges.forEach(challenge => {
      this.challenges.set(challenge.id, challenge);
    });
  }

  // Validate flag submission
  async validateFlag(challengeId, flag, userId) {
    const challenge = this.challenges.get(parseInt(challengeId));
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const isCorrect = flag.trim() === challenge.flag;
    const submission = {
      id: crypto.randomUUID(),
      challengeId: parseInt(challengeId),
      userId,
      flag,
      isCorrect,
      timestamp: new Date().toISOString()
    };

    this.submissions.set(submission.id, submission);

    if (isCorrect && !challenge.solvedBy.has(userId)) {
      challenge.solvedBy.add(userId);
      this.updateLeaderboard(userId, challenge.points);
    }

    return {
      correct: isCorrect,
      message: isCorrect ? 'Flag correct! Well done!' : 'Incorrect flag. Try again!',
      points: isCorrect ? challenge.points : 0,
      submissionId: submission.id
    };
  }

  // Update leaderboard
  updateLeaderboard(userId, points) {
    if (!this.leaderboard.has(userId)) {
      this.leaderboard.set(userId, {
        userId,
        points: 0,
        challengesSolved: 0,
        lastSubmission: new Date().toISOString()
      });
    }

    const user = this.leaderboard.get(userId);
    user.points += points;
    user.challengesSolved += 1;
    user.lastSubmission = new Date().toISOString();
  }

  // Get leaderboard
  getLeaderboard() {
    return Array.from(this.leaderboard.values())
      .sort((a, b) => b.points - a.points)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  }

  // Get challenges
  getChallenges() {
    return Array.from(this.challenges.values()).map(challenge => ({
      ...challenge,
      solvedBy: challenge.solvedBy.size,
      solvedBy: undefined // Don't expose solved users
    }));
  }

  // Get user progress
  getUserProgress(userId) {
    const user = this.leaderboard.get(userId);
    if (!user) return null;

    const solvedChallenges = Array.from(this.challenges.values())
      .filter(challenge => challenge.solvedBy.has(userId));

    return {
      userId,
      points: user.points,
      challengesSolved: user.challengesSolved,
      solvedChallenges: solvedChallenges.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        points: c.points
      })),
      lastSubmission: user.lastSubmission
    };
  }
}

module.exports = CTFService;
