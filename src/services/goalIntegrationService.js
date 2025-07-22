// Goal Integration Service for automatic cash flow integration and predictive analytics
class GoalIntegrationService {
  constructor() {
    this.monthlyDataHistory = [];
  }

  /**
   * Calculate automatic contributions to goals based on net cash flow
   * @param {number} netCashFlow - Monthly net cash flow
   * @param {Array} goals - Array of goal objects
   * @param {Object} settings - Configuration settings
   * @returns {Array} Array of goal contributions
   */
  calculateAutoContributions(netCashFlow, goals, settings = {}) {
    const {
      contributionPercentage = 0.3, // 30% of net cash flow by default
      emergencyFundPriority = true,
      priorityBased = false, // Use manual priority order
      minContribution = 50 // Minimum contribution per goal
    } = settings;

    if (netCashFlow <= 0 || goals.length === 0) {
      return [];
    }

    const totalAvailableForGoals = netCashFlow * contributionPercentage;
    const contributions = [];

    // Sort goals by priority
    let sortedGoals;
    
    if (priorityBased && goals.some(g => g.priority !== undefined)) {
      // Use manual priority order (lower number = higher priority)
      sortedGoals = [...goals].sort((a, b) => {
        const aPriority = a.priority || 999;
        const bPriority = b.priority || 999;
        return aPriority - bPriority;
      });
    } else {
      // Use automatic priority (emergency fund first, then by target date)
      sortedGoals = [...goals].sort((a, b) => {
        // Emergency fund always first
        if (emergencyFundPriority) {
          const aIsEmergency = a.category === 'emergency' || a.name.toLowerCase().includes('acil');
          const bIsEmergency = b.category === 'emergency' || b.name.toLowerCase().includes('acil');
          
          if (aIsEmergency && !bIsEmergency) return -1;
          if (!aIsEmergency && bIsEmergency) return 1;
        }
        
        // Then by target date (sooner first)
        const aDate = new Date(a.targetDate);
        const bDate = new Date(b.targetDate);
        return aDate - bDate;
      });
    }

    let remainingAmount = totalAvailableForGoals;

    for (const goal of sortedGoals) {
      if (remainingAmount <= 0) break;

      const contribution = this.calculateGoalContribution(goal, remainingAmount, minContribution);
      if (contribution > 0) {
        contributions.push({
          goalId: goal.id,
          amount: contribution,
          date: new Date().toISOString(),
          type: 'auto_contribution',
          source: 'net_cash_flow'
        });
        remainingAmount -= contribution;
      }
    }

    return contributions;
  }

  // Calculate individual goal contribution
  calculateGoalContribution(goal, availableAmount, minContribution = 50) {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return 0;

    // Calculate based on urgency and available amount
    const monthsUntilTarget = this.getMonthsUntilTarget(goal.targetDate);
    const urgencyMultiplier = Math.max(0.1, Math.min(2, 12 / monthsUntilTarget));
    
    let contribution = Math.min(
      remaining,
      availableAmount * 0.5 * urgencyMultiplier
    );

    // Apply minimum contribution threshold
    if (contribution < minContribution && availableAmount >= minContribution) {
      contribution = Math.min(minContribution, remaining, availableAmount);
    }

    return Math.round(contribution);
  }

  // Get days until target date
  getDaysUntilTarget(targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    const diffTime = target - now;
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Get months until target date
  getMonthsUntilTarget(targetDate) {
    const target = new Date(targetDate);
    const now = new Date();
    const diffMonths = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(1, diffMonths);
  }

  // Predict goal achievement date based on current progress
  predictAchievementDate(goal, monthlyNetCashFlow, contributionRate = 0.3) {
    const remaining = goal.targetAmount - goal.currentAmount;
    if (remaining <= 0) return new Date(); // Already achieved

    const monthlyContribution = Math.max(0, monthlyNetCashFlow * contributionRate);
    if (monthlyContribution <= 0) return null; // Cannot achieve with current cash flow

    const monthsNeeded = Math.ceil(remaining / monthlyContribution);
    const achievementDate = new Date();
    achievementDate.setMonth(achievementDate.getMonth() + monthsNeeded);
    
    return achievementDate;
  }

  // Calculate goal progress percentage
  calculateProgress(goal) {
    if (goal.targetAmount <= 0) return 0;
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  }

  // Generate goal insights and recommendations
  generateGoalInsights(goals, monthlyNetCashFlow) {
    const insights = [];

    goals.forEach(goal => {
      const progress = this.calculateProgress(goal);
      const daysUntilTarget = this.getDaysUntilTarget(goal.targetDate);
      const predictedDate = this.predictAchievementDate(goal, monthlyNetCashFlow);
      
      const insight = {
        goalId: goal.id,
        goalName: goal.name,
        progress: progress,
        status: this.getGoalStatus(goal, predictedDate),
        daysUntilTarget: daysUntilTarget,
        predictedAchievementDate: predictedDate,
        isOnTrack: this.isGoalOnTrack(goal, predictedDate),
        recommendations: this.getGoalRecommendations(goal, monthlyNetCashFlow, predictedDate)
      };

      insights.push(insight);
    });

    return insights;
  }

  // Get goal status
  getGoalStatus(goal, predictedDate) {
    const targetDate = new Date(goal.targetDate);
    const progress = this.calculateProgress(goal);

    if (progress >= 100) return 'completed';
    if (!predictedDate) return 'at_risk';
    if (predictedDate <= targetDate) return 'on_track';
    if (predictedDate > targetDate) return 'behind_schedule';
    
    return 'in_progress';
  }

  // Check if goal is on track
  isGoalOnTrack(goal, predictedDate) {
    if (!predictedDate) return false;
    const targetDate = new Date(goal.targetDate);
    return predictedDate <= targetDate;
  }

  // Get goal recommendations
  getGoalRecommendations(goal, monthlyNetCashFlow, predictedDate) {
    const recommendations = [];
    const targetDate = new Date(goal.targetDate);
    const progress = this.calculateProgress(goal);

    if (progress >= 100) {
      recommendations.push({
        type: 'success',
        message: 'Tebrikler! Bu hedefe ulaştınız.',
        action: 'consider_new_goal'
      });
    } else if (!predictedDate || predictedDate > targetDate) {
      const remaining = goal.targetAmount - goal.currentAmount;
      const daysLeft = this.getDaysUntilTarget(goal.targetDate);
      const requiredMonthly = remaining / (daysLeft / 30);
      
      recommendations.push({
        type: 'warning',
        message: `Hedefe ulaşmak için aylık ₺${requiredMonthly.toLocaleString('tr-TR')} biriktirmeniz gerekiyor.`,
        action: 'increase_contribution'
      });

      if (monthlyNetCashFlow > 0) {
        const requiredRate = requiredMonthly / monthlyNetCashFlow;
        if (requiredRate > 0.5) {
          recommendations.push({
            type: 'suggestion',
            message: 'Hedef tarihi çok yakın. Tarihi ertelemeyi veya hedef miktarını azaltmayı düşünün.',
            action: 'adjust_goal'
          });
        }
      }
    } else {
      recommendations.push({
        type: 'success',
        message: 'Hedefiniz için doğru yoldasınız!',
        action: 'maintain_pace'
      });
    }

    return recommendations;
  }

  // Update goal with automatic contribution
  updateGoalWithContribution(goal, contribution) {
    return {
      ...goal,
      currentAmount: goal.currentAmount + contribution.amount,
      lastContribution: contribution,
      updatedAt: new Date().toISOString(),
      contributions: [...(goal.contributions || []), contribution]
    };
  }

  // Calculate monthly averages for better predictions
  calculateMonthlyAverages(transactions, months = 3) {
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= cutoffDate
    );

    const monthlyData = {};
    
    recentTransactions.forEach(transaction => {
      const month = new Date(transaction.date).toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });

    const monthlyNetFlows = Object.values(monthlyData).map(data => 
      data.income - data.expenses
    );

    return {
      averageMonthlyNetFlow: monthlyNetFlows.reduce((sum, flow) => sum + flow, 0) / Math.max(1, monthlyNetFlows.length),
      monthlyData: monthlyData,
      trend: this.calculateTrend(monthlyNetFlows)
    };
  }

  // Calculate trend (improving, declining, stable)
  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const recent = values.slice(-2);
    const change = recent[1] - recent[0];
    const changePercentage = Math.abs(change) / Math.max(1, Math.abs(recent[0]));
    
    if (changePercentage < 0.1) return 'stable';
    return change > 0 ? 'improving' : 'declining';
  }
}

export default new GoalIntegrationService();
