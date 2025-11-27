import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { supabase, Reward } from '../lib/supabase';

export default function AdminPanel() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reward_type: 'weekly' as 'weekly' | 'monthly',
    prize_amount: '',
    start_date: '',
    end_date: '',
    game_type: 'all' as 'memory' | 'guess' | 'reaction' | 'all',
    is_active: true,
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingReward) {
        const { error } = await supabase
          .from('rewards')
          .update({ ...formData, updated_at: new Date().toISOString() })
          .eq('id', editingReward.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('rewards')
          .insert([formData]);

        if (error) throw error;
      }

      resetForm();
      fetchRewards();
    } catch (error) {
      console.error('Error saving reward:', error);
      alert('Failed to save reward. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reward?')) return;

    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      alert('Failed to delete reward. Please try again.');
    }
  };

  const toggleActive = async (reward: Reward) => {
    try {
      const { error } = await supabase
        .from('rewards')
        .update({ is_active: !reward.is_active, updated_at: new Date().toISOString() })
        .eq('id', reward.id);

      if (error) throw error;
      fetchRewards();
    } catch (error) {
      console.error('Error updating reward:', error);
    }
  };

  const startEdit = (reward: Reward) => {
    setEditingReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description,
      reward_type: reward.reward_type,
      prize_amount: reward.prize_amount,
      start_date: reward.start_date.split('T')[0],
      end_date: reward.end_date.split('T')[0],
      game_type: (reward.game_type || 'all') as any,
      is_active: reward.is_active,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reward_type: 'weekly',
      prize_amount: '',
      start_date: '',
      end_date: '',
      game_type: 'all',
      is_active: true,
    });
    setEditingReward(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Rewards Admin Panel</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
          >
            <Plus size={20} />
            {showForm ? 'Cancel' : 'New Reward'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingReward ? 'Edit Reward' : 'Create New Reward'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Prize Amount *
                  </label>
                  <input
                    type="text"
                    value={formData.prize_amount}
                    onChange={(e) => setFormData({ ...formData, prize_amount: e.target.value })}
                    placeholder="e.g., 100 $FEAST"
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Reward Type *
                  </label>
                  <select
                    value={formData.reward_type}
                    onChange={(e) => setFormData({ ...formData, reward_type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Game Type *
                  </label>
                  <select
                    value={formData.game_type}
                    onChange={(e) => setFormData({ ...formData, game_type: e.target.value as any })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="all">All Games</option>
                    <option value="memory">Turkey Memory</option>
                    <option value="guess">Feast Fortune</option>
                    <option value="reaction">Turkey Speed Test</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-slate-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
                >
                  {editingReward ? 'Update' : 'Create'} Reward
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">All Rewards</h2>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-slate-900">{reward.title}</h3>
                      {reward.is_active && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-2">{reward.description}</p>
                    <div className="flex gap-4 text-sm text-slate-500">
                      <span>Prize: {reward.prize_amount}</span>
                      <span>Type: {reward.reward_type}</span>
                      <span>
                        {new Date(reward.start_date).toLocaleDateString()} -{' '}
                        {new Date(reward.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(reward)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                      title="Toggle Active"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                      onClick={() => startEdit(reward)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      title="Edit"
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Delete"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {rewards.length === 0 && (
              <p className="text-center text-slate-500 py-8">No rewards created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
