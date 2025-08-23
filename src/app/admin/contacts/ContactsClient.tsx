'use client'

import { useState } from 'react'
import { Mail, Building, Eye, CheckCircle, Clock, AlertCircle, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Contact {
  id: string
  name: string
  email: string
  company?: string
  category: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

interface ContactsClientProps {
  contacts: Contact[]
}

export default function ContactsClient({ contacts: initialContacts }: ContactsClientProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      general: 'bg-gray-100 text-gray-800',
      idea: 'bg-blue-100 text-blue-800',
      development: 'bg-green-100 text-green-800',
      business: 'bg-purple-100 text-purple-800',
      bug: 'bg-red-100 text-red-800',
      other: 'bg-yellow-100 text-yellow-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      general: '一般的なお問い合わせ',
      idea: 'アイデア・企画について',
      development: '開発について',
      business: 'ビジネス提携について',
      bug: '不具合報告',
      other: 'その他'
    }
    return labels[category] || category
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case 'read':
        return <Eye className="w-4 h-4 text-blue-500" />
      case 'replied':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      unread: '未読',
      read: '既読',
      replied: '返信済み'
    }
    return labels[status] || status
  }

  const updateContactStatus = async (contactId: string, newStatus: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('contacts')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', contactId)

    if (!error) {
      setContacts(prev => 
        prev.map(contact => 
          contact.id === contactId 
            ? { ...contact, status: newStatus, updated_at: new Date().toISOString() }
            : contact
        )
      )
      if (selectedContact?.id === contactId) {
        setSelectedContact(prev => prev ? { ...prev, status: newStatus } : null)
      }
    }
  }

  const filteredContacts = contacts.filter(contact => {
    const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || contact.category === categoryFilter
    const matchesSearch = searchTerm === '' || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesCategory && matchesSearch
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">お問い合わせ管理</h1>
        <p className="text-gray-600 mt-2">顧客からのお問い合わせ対応・管理</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contacts List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="unread">未読</option>
                  <option value="read">既読</option>
                  <option value="replied">返信済み</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">すべて</option>
                  <option value="general">一般的なお問い合わせ</option>
                  <option value="idea">アイデア・企画について</option>
                  <option value="development">開発について</option>
                  <option value="business">ビジネス提携について</option>
                  <option value="bug">不具合報告</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">検索</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="名前、メール、内容で検索..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-gray-700">未読</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {contacts.filter(c => c.status === 'unread').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">既読</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {contacts.filter(c => c.status === 'read').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">返信済み</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {contacts.filter(c => c.status === 'replied').length}
              </div>
            </div>
          </div>

          {/* Contacts List */}
          <div className="space-y-3">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact)
                  if (contact.status === 'unread') {
                    updateContactStatus(contact.id, 'read')
                  }
                }}
                className={`bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedContact?.id === contact.id ? 'ring-2 ring-blue-500' : ''
                } ${contact.status === 'unread' ? 'border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(contact.status)}
                    <span className="font-medium text-gray-900">{contact.name}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(contact.category)}`}>
                      {getCategoryLabel(contact.category)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(contact.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Mail className="w-4 h-4" />
                  <span>{contact.email}</span>
                  {contact.company && (
                    <>
                      <Building className="w-4 h-4 ml-2" />
                      <span>{contact.company}</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{contact.message}</p>
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">お問い合わせがありません</h3>
                <p className="text-gray-600">該当するお問い合わせが見つかりませんでした。</p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Detail */}
        <div className="lg:col-span-1">
          {selectedContact ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-8">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">お問い合わせ詳細</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedContact.status)}
                    <span className="text-sm text-gray-600">{getStatusLabel(selectedContact.status)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
                    <p className="text-sm text-gray-900">{selectedContact.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                    <p className="text-sm text-gray-900">{selectedContact.email}</p>
                  </div>

                  {selectedContact.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">会社名</label>
                      <p className="text-sm text-gray-900">{selectedContact.company}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(selectedContact.category)}`}>
                      {getCategoryLabel(selectedContact.category)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">お問い合わせ内容</label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                      {selectedContact.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                    <div>
                      <label className="block font-medium mb-1">受信日時</label>
                      <p>{formatDate(selectedContact.created_at)}</p>
                    </div>
                    <div>
                      <label className="block font-medium mb-1">更新日時</label>
                      <p>{formatDate(selectedContact.updated_at)}</p>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ステータス変更</label>
                    <div className="space-y-2">
                      <button
                        onClick={() => updateContactStatus(selectedContact.id, 'read')}
                        disabled={selectedContact.status === 'read'}
                        className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedContact.status === 'read'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        既読にする
                      </button>
                      <button
                        onClick={() => updateContactStatus(selectedContact.id, 'replied')}
                        disabled={selectedContact.status === 'replied'}
                        className={`w-full px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedContact.status === 'replied'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        返信済みにする
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-200">
                    <a
                      href={`mailto:${selectedContact.email}?subject=Re: お問い合わせについて&body=お世話になっております。%0A%0AEmBldサポートチームです。%0A%0Aお問い合わせいただき、ありがとうございます。%0A%0A`}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      メールで返信
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">お問い合わせを選択</h3>
              <p className="text-gray-600">左側のリストからお問い合わせを選択してください。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}