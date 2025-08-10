import React, { useState } from 'react';
import { XMarkIcon, FlagIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

const ReportModal = ({ isOpen, onClose, reportableType, reportableId, title }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const reasons = [
        { value: 'spam', label: 'Spam or advertising' },
        { value: 'harassment', label: 'Harassment or bullying' },
        { value: 'inappropriate', label: 'Inappropriate content' },
        { value: 'copyright', label: 'Copyright violation' },
        { value: 'other', label: 'Other' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason) {
            setError('Please select a reason for reporting');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await api.post('/reports', {
                reportable_type: reportableType,
                reportable_id: reportableId,
                reason,
                description: description.trim() || null,
            });

            // Reset form
            setReason('');
            setDescription('');
            onClose();
            
            // Show success message (you might want to use a toast library)
            alert('Report submitted successfully. Our moderation team will review it.');
        } catch (error) {
            if (error.response?.status === 422) {
                setError(error.response.data.message || 'You have already reported this content');
            } else {
                setError('Failed to submit report. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <FlagIcon className="h-5 w-5 text-red-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Report Content</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {title && (
                        <div className="mb-4 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-600">Reporting: {title}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Why are you reporting this content? *
                            </label>
                            <div className="space-y-2">
                                {reasons.map((reasonOption) => (
                                    <label key={reasonOption.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="reason"
                                            value={reasonOption.value}
                                            checked={reason === reasonOption.value}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="mr-2 text-blue-600"
                                        />
                                        <span className="text-sm text-gray-700">{reasonOption.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Additional details (optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Provide any additional context about why you're reporting this content..."
                                maxLength={1000}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {description.length}/1000 characters
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !reason}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
