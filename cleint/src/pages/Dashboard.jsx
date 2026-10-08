import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getRooms, getBookings, createBooking } from '../services/api';

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [filterRoomId, setFilterRoomId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    fetchRoomBookings(filterRoomId, page);
  }, [filterRoomId, page]);

  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchRoomBookings = async (rId, p) => {
    setLoading(true);
    try {
      const res = await getBookings(rId, p, limit);
      setBookings(res.data.data);
      setTotalPages(res.data.pages);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
    setLoading(false);
  };

  const onSubmit = async (data) => {
    setStatus({ type: '', message: '' });

    try {
      await createBooking(data);

      setStatus({ type: 'success', message: 'Room booked successfully!' });
      reset();

      if (data.roomId === filterRoomId) {
        if (page !== 1) setPage(1);
        else fetchRoomBookings(filterRoomId, 1);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to book room';
      setStatus({ type: 'error', message: errorMsg });
    }
  };

  const selectedRoomName = filterRoomId ? rooms.find(r => r._id === filterRoomId)?.name || 'Unknown Room' : 'All Rooms';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Room Booking Dashboard</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          <div className="md:col-span-4 bg-white p-6 border rounded shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Book a Room</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Room</label>
                <select
                  {...register('roomId', { required: 'Please select a room' })}
                  defaultValue=""
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                >
                  <option value="" disabled>Select Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>{room.name}</option>
                  ))}
                </select>
                {errors.roomId && <p className="text-red-500 text-xs mt-1">{errors.roomId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="text"
                  {...register('userEmail', {
                    required: 'Email is required',
                    pattern: {
                      value: /.+@.+\..+/,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.userEmail && <p className="text-red-500 text-xs mt-1">{errors.userEmail.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  {...register('startTime', { required: 'Start Time is required' })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  {...register('endTime', {
                    required: 'End Time is required',
                    validate: (value, formValues) => {
                      if (formValues.startTime && new Date(value) <= new Date(formValues.startTime)) {
                        return 'End time must be strictly greater than start time';
                      }
                      return true;
                    }
                  })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime.message}</p>}
              </div>

              {status.message && (
                <div className={`p-3 rounded text-sm ${status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Booking...' : 'Book Room'}
              </button>
            </form>
          </div>

          <div className="md:col-span-8 bg-white p-6 border rounded shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Bookings for {selectedRoomName}
              </h2>
            </div>

            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b">
              <button
                onClick={() => {
                  setFilterRoomId('');
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-t whitespace-nowrap font-medium transition-colors ${filterRoomId === ''
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                All
              </button>
              {rooms.map(room => (
                <button
                  key={room._id}
                  onClick={() => {
                    setFilterRoomId(room._id);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-t whitespace-nowrap font-medium transition-colors ${filterRoomId === room._id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {room.name}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {loading ? (
                <div className="text-center py-10 bg-gray-50 rounded border border-dashed">
                  <p className="text-gray-500 animate-pulse">Loading bookings...</p>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded border border-dashed">
                  <p className="text-gray-500">No bookings found for {selectedRoomName}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="p-3 text-sm font-semibold text-gray-700">Room Name</th>
                        <th className="p-3 text-sm font-semibold text-gray-700">User Email</th>
                        <th className="p-3 text-sm font-semibold text-gray-700">Time Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-sm text-gray-800 font-medium">{booking.roomId?.name || 'Unknown'}</td>
                          <td className="p-3 text-sm text-gray-800">{booking.userEmail}</td>
                          <td className="p-3 text-sm text-gray-800">{booking.startTime} - {booking.endTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!loading && bookings.length > 0 && (
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {page} of {totalPages || 1}
                </p>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-4 py-2 border rounded text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 border rounded text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

