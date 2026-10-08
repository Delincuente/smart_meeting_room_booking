import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { getRooms, getBookings, createBooking } from '../services/api';

// use rect hook form for form handling
export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [filterRoomId, setFilterRoomId] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (filterRoomId) {
      fetchRoomBookings(filterRoomId, page);
    }
  }, [filterRoomId, page]);

  const fetchRooms = async () => {
    try {
      const res = await getRooms();
      setRooms(res.data);
      if (res.data.length > 0) {
        setFilterRoomId(res.data[0]._id);
      }
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
      reset(); // Clears all form fields back to default values

      // If we booked the room that is currently selected in the tabs, refresh it
      if (data.roomId === filterRoomId) {
        // Option to go back to page 1 to see the newest booking
        if (page !== 1) setPage(1);
        else fetchRoomBookings(filterRoomId, 1);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to book room';
      setStatus({ type: 'error', message: errorMsg });
    }
  };

  const selectedRoomName = rooms.find(r => r._id === filterRoomId)?.name || 'Unknown Room';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Room Booking Dashboard</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Booking Form */}
          <div className="md:col-span-4 bg-white p-6 border rounded shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Book a Room</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Room</label>
                <select
                  {...register('roomId', { required: true })}
                  defaultValue=""
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                >
                  <option value="" disabled>Select Room</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>{room.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  {...register('userEmail', { required: true })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  {...register('startTime', { required: true })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                <input
                  type="datetime-local"
                  {...register('endTime', { required: true })}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
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

          {/* Room List and Bookings List */}
          <div className="md:col-span-8 bg-white p-6 border rounded shadow-sm flex flex-col h-full min-h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700">
                Bookings for {selectedRoomName}
              </h2>
            </div>

            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b">
              {rooms.map(room => (
                <button
                  key={room._id}
                  onClick={() => {
                    setFilterRoomId(room._id);
                    setPage(1); // Reset page on tab change
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

            {/* Bookings List Area */}
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

            {/* Pagination Controls */}
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
