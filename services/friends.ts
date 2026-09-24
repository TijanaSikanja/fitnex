import { supabase } from './supabase';



export type FriendshipStatus = 'accepted' | 'pending_sent' | 'pending_received' | null;

export type UserSearchResult = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  friendship_status: FriendshipStatus;
};

export type PendingFriendRequest = {
  friendship_id: string;
  requester_id: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
};

export type LeaderboardEntry = {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_points: number;
  points_this_week: number;
  is_me: boolean;
};


export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  if (!query.trim()) return [];

  const { data, error } = await supabase.rpc('search_users', { p_query: query.trim() });

  if (error) {
    console.log('searchUsers error:', error.message);
    return [];
  }
  return data || [];
}

export async function sendFriendRequest(addresseeId: string) {
  const { data, error } = await supabase.rpc('send_friend_request', {
    p_addressee_id: addresseeId,
  });

  if (error) {
    console.log('sendFriendRequest error:', error.message);
    return null;
  }
  return data;
}

export async function respondFriendRequest(friendshipId: string, accept: boolean) {
  const { data, error } = await supabase.rpc('respond_friend_request', {
    p_friendship_id: friendshipId,
    p_accept: accept,
  });

  if (error) {
    console.log('respondFriendRequest error:', error.message);
    return null;
  }
  return data;
}

export async function removeFriend(friendshipId: string) {
  const { error } = await supabase.rpc('remove_friend', {
    p_friendship_id: friendshipId,
  });

  if (error) {
    console.log('removeFriend error:', error.message);
    return false;
  }
  return true;
}

export async function getPendingFriendRequests(): Promise<PendingFriendRequest[]> {
  const { data, error } = await supabase.rpc('get_pending_friend_requests');

  if (error) {
    console.log('getPendingFriendRequests error:', error.message);
    return [];
  }
  return data || [];
}

export async function getFriendsLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_friends_leaderboard');

  if (error) {
    console.log('getFriendsLeaderboard error:', error.message);
    return [];
  }
  return data || [];
}

export const friendsService = {
  searchUsers,
  sendFriendRequest,
  respondFriendRequest,
  removeFriend,
  getPendingFriendRequests,
  getFriendsLeaderboard,
};