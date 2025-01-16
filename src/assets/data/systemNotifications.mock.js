export const NOTIFICATION_STATUSES = [
	{
		id: 1,
		user_code: 'created',
		name: 'Created'
	},
	{
		id: 2,
		user_code: 'updated',
		name: 'Updated'
	},
	{
		id: 3,
		user_code: 'archived',
		name: 'Archived'
	}
];

export const NOTIFICATION_CATEGORIES = [
	{
		id: 1,
		user_code: 'alerts',
		name: 'System Alerts',
		parent_category: null
	},
	{
		id: 2,
		user_code: 'critical-alerts',
		name: 'Critical Alerts',
		parent_category: 'system-alerts'
	},
	{
		id: 3,
		user_code: 'warning-alerts',
		name: 'Warning Alerts',
		parent_category: 'system-alerts'
	},
	{
		id: 4,
		user_code: 'events',
		name: 'Events',
		parent_category: null
	},
	{
		id: 5,
		user_code: 'system-events',
		name: 'System Events',
		parent_category: 'events'
	},
	{
		id: 6,
		user_code: 'security-events',
		name: 'Security Events',
		parent_category: 'system-events'
	},
	{
		id: 7,
		user_code: 'general',
		name: 'General',
		parent_category: null
	}
];

export const SUBSCRIPTIONS = [
	{
		user_code: 'email',
		name: 'Email',
		description: 'emails',
		is_subscribed: true
	},
	{
		user_code: 'slack',
		name: 'slack',
		description: 'slack',
		is_subscribed: false
	}
];

export const NOTIFICATIONS = [
	{
		title: 'My notification 1',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'general',
		content: 'Some interesting content with keywords and stuff',
		priority: 'high',
		owner: 'test_user',
		source_name: 'important_admin',
		user_code: 'abc-def-123',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:18.151067Z',
		modified_at: '2025-01-15T02:59:18.151113Z'
	},
	{
		title: 'My notification 2',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'events',
		content: 'Random content about events happening soon.',
		priority: 'normal',
		owner: 'user_one',
		source_name: 'important_admin',
		user_code: 'ghi-jkl-456',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:20.151067Z',
		modified_at: '2025-01-15T02:59:20.151113Z'
	},
	{
		title: 'My notification 3',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'alerts',
		content: 'Important alert regarding system updates.',
		priority: 'high',
		owner: 'user_two',
		source_name: 'important_admin',
		user_code: 'mno-pqr-789',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:22.151067Z',
		modified_at: '2025-01-15T02:59:22.151113Z'
	},
	{
		title: 'My notification 4',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'general',
		content: 'New features added to the application.',
		priority: 'normal',
		owner: 'test_user_2',
		source_name: 'important_admin',
		user_code: 'stu-vwx-012',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:24.151067Z',
		modified_at: '2025-01-15T02:59:24.151113Z'
	},
	{
		title: 'My notification 5',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'events',
		content: 'Exciting updates on upcoming events.',
		priority: 'high',
		owner: '',
		source_name: 'important_admin',
		user_code: 'yz-abc-345',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:26.151067Z',
		modified_at: '2025-01-15T02:59:26.151113Z'
	},
	{
		title: 'My notification 6',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'alerts',
		content: 'Alert: Maintenance scheduled for tonight.',
		priority: 'normal',
		owner: 'random_user_1',
		source_name: 'important_admin',
		user_code: 'def-ghi-678',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:28.151067Z',
		modified_at: '2025-01-15T02:59:28.151113Z'
	},
	{
		title: 'My notification 7',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'general',
		content: 'General update: System performance improvements.',
		priority: 'high',
		owner: 'random_user_2',
		source_name: 'important_admin',
		user_code: 'jkl-mno-901',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:30.151067Z',
		modified_at: '2025-01-15T02:59:30.151113Z'
	},
	{
		title: 'My notification 8',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'events',
		content: "Don't miss our upcoming webinar!",
		priority: 'normal',
		owner: 'test_user_3',
		source_name: 'important_admin',
		user_code: 'pqr-stu-234',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:32.151067Z',
		modified_at: '2025-01-15T02:59:32.151113Z'
	},
	{
		title: 'My notification 9',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'alerts',
		content: 'Security alert: Password change required.',
		priority: 'high',
		owner: 'random_user_3',
		source_name: 'important_admin',
		user_code: 'vwx-yz-567',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:34.151067Z',
		modified_at: '2025-01-15T02:59:34.151113Z'
	},
	{
		title: 'My notification 10',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'general',
		content: 'Update: New policies are now in effect.',
		priority: 'normal',
		owner: 'test_user_4',
		source_name: 'important_admin',
		user_code: 'abc-def-890',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:36.151067Z',
		modified_at: '2025-01-15T02:59:36.151113Z'
	},
	{
		title: 'My notification 11',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'events',
		content: 'Join us for the annual company retreat!',
		priority: 'high',
		owner: 'random_user_4',
		source_name: 'important_admin',
		user_code: 'ghi-jkl-123',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:38.151067Z',
		modified_at: '2025-01-15T02:59:38.151113Z'
	},
	{
		title: 'My notification 12',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'alerts',
		content: 'Critical update: Action required !',
		priority: 'normal',
		owner: 'test_user_5',
		source_name: 'important_admin',
		user_code: 'mno-pqr-456',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:40.151067Z',
		modified_at: '2025-01-15T02:59:40.151113Z'
	},
	{
		title: 'My notification 13',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'general',
		content: 'Reminder: Submit your timesheets .',
		priority: 'high',
		owner: 'random_user_5',
		source_name: 'important_admin',
		user_code: 'stu-vwx-789',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:42.151067Z',
		modified_at: '2025-01-15T02:59:42.151113Z'
	},
	{
		title: 'My notification 14',
		channel: 'alerts-123',
		current_status: 'updated',
		category: 'events',
		content: 'New event added to the calendar !',
		priority: 'normal',
		owner: 'test_user_6',
		source_name: 'important_admin',
		user_code: 'yz-abcd-012',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:44.151067Z',
		modified_at: '2025-01-15T02:59:44.151113Z'
	},
	{
		title: 'My notification 15',
		channel: 'general-485e03fb',
		current_status: 'created',
		category: 'alerts',
		content: 'System alert: Backup completed successfully .',
		priority: 'high',
		owner: 'random_user_6',
		source_name: 'important_admin',
		user_code: 'ef-ghij-klm',
		ttl: '120 00:00:00',
		created_at: '2025-01-15T02:59:46.151067Z',
		modified_at: '2025-01-15T02:59:46.151113Z'
	}
];

export const CHANNELS = [
	{
		id: 1,
		user_code: 'general-485e03fb',
		name: 'General',
		description:
			'This is the general channel. It serves as a primary hub for all users to engage in discussions, share updates, and collaborate on various topics. Whether you are looking for information or simply want to connect with others, this channel is the place to be.'
	},
	{
		id: 2,
		user_code: 'alerts-123',
		name: 'Alerts',
		description:
			'This is the alerts channel. Here, users receive timely notifications about important updates, system changes, and critical events. Staying informed is key, and this channel ensures that you never miss out on vital information that could affect your work or interests.'
	},
	{
		id: 3,
		user_code: 'alerts-channel-f771330b',
		name: 'Alerts Channel',
		description:
			'This is the alerts channel. It is dedicated to delivering real-time alerts and announcements. Users can expect to receive notifications regarding new features, scheduled maintenance, and any urgent issues that may arise. This channel is essential for those who want to stay ahead of the curve.'
	},
	{
		id: 4,
		user_code: 'updates-9c1e4f2a',
		name: 'Updates',
		description:
			"This channel provides regular updates about ongoing projects and initiatives. Users can find detailed reports on progress, upcoming milestones, and insights into team performance. Engaging with this channel helps everyone stay aligned and informed about the organization's goals."
	},
	{
		id: 5,
		user_code: 'feedback-3a2d5b6c',
		name: 'Feedback',
		description:
			'The feedback channel is a space where users can share their thoughts and suggestions about various topics. Constructive criticism and positive reinforcement are both welcome here. This channel aims to foster a culture of continuous improvement by encouraging open dialogue among team members.'
	},
	{
		id: 6,
		user_code: 'resources-1f4e8d3b',
		name: 'Resources',
		description:
			'In the resources channel, users can access a wealth of information including documents, links, and tools that support their work. This channel serves as a repository for best practices, tutorials, and reference materials that can enhance productivity and knowledge sharing within the team.'
	}
];
