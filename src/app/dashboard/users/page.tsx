'use client';

import { useState } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';

export default function UsersPage() {
  const [selectedRole, setSelectedRole] = useState('all');

  type Teacher = {
    id: number;
    name: string;
    email: string;
    role: 'TEACHER';
    subjects: string[];
    status: string;
  };

  type Student = {
    id: number;
    name: string;
    email: string;
    role: 'STUDENT';
    grade: string;
    status: string;
  };

  type User = Teacher | Student;

  const users: User[] = [
    {
      id: 1,
      name: 'Dr. John Smith',
      email: 'john.smith@example.com',
      role: 'TEACHER',
      subjects: ['Mathematics', 'Physics'],
      status: 'active',
    },
    {
      id: 2,
      name: 'Prof. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'TEACHER',
      subjects: ['Chemistry', 'Biology'],
      status: 'active',
    },
    {
      id: 3,
      name: 'Alice Brown',
      email: 'alice.brown@example.com',
      role: 'STUDENT',
      grade: '12th Grade',
      status: 'active',
    },
    {
      id: 4,
      name: 'Bob Wilson',
      email: 'bob.wilson@example.com',
      role: 'STUDENT',
      grade: '11th Grade',
      status: 'active',
    },
  ];

  const filteredUsers = selectedRole === 'all' 
    ? users 
    : users.filter(user => user.role.toLowerCase() === selectedRole);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <button
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <select 
          className="rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="teacher">Teachers</option>
          <option value="student">Students</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Name
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Role
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      {user.role === 'TEACHER' && (
                        <div className="text-gray-500">{user.subjects.join(', ')}</div>
                      )}
                      {user.role === 'STUDENT' && (
                        <div className="text-gray-500">{user.grade}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{user.email}</td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${user.role === 'TEACHER' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role.toLowerCase()}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                    {user.status}
                  </span>
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <button className="text-gray-400 hover:text-gray-500">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
