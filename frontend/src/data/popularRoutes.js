// src/data/popularRoutes.js
import { trains } from './trains'

// Lấy giá từ dữ liệu tàu thật
const getPriceFromTrain = (from, to) => {
  const train = trains.find(t => t.fromStation === from && t.toStation === to)
  return train ? train.priceFrom : 0
}

const getDurationFromTrain = (from, to) => {
  const train = trains.find(t => t.fromStation === from && t.toStation === to)
  return train ? train.duration : 'N/A'
}

export const popularRoutes = [
  {
    id: 1,
    trainName: 'Tàu Hoa Phượng Đỏ HP1',
    from: 'Hà Nội',
    to: 'Hải Phòng',
    duration: getDurationFromTrain('Hà Nội', 'Hải Phòng'),
    price: getPriceFromTrain('Hà Nội', 'Hải Phòng'),
    trainCode: 'HP1'
  },
  {
    id: 2,
    trainName: 'Tàu di sản HD2',
    from: 'Đà Nẵng',
    to: 'Huế',
    duration: getDurationFromTrain('Đà Nẵng', 'Huế'),
    price: getPriceFromTrain('Đà Nẵng', 'Huế'),
    trainCode: 'HD2'
  },
  {
    id: 3,
    trainName: 'Tàu La Reine DL11',
    from: 'Đà Lạt',
    to: 'Trại Mát',
    duration: getDurationFromTrain('Đà Lạt', 'Trại Mát'),
    price: getPriceFromTrain('Đà Lạt', 'Trại Mát'),
    trainCode: 'DL11'
  },
  {
    id: 4,
    trainName: 'Tàu Sông Lam NA1',
    from: 'Hà Nội',
    to: 'Vinh',
    duration: getDurationFromTrain('Hà Nội', 'Vinh'),
    price: getPriceFromTrain('Hà Nội', 'Vinh'),
    trainCode: 'NA1'
  },
  {
    id: 5,
    trainName: 'Tàu du lịch SPT2',
    from: 'Sài Gòn',
    to: 'Phan Thiết',
    duration: getDurationFromTrain('Sài Gòn', 'Phan Thiết'),
    price: getPriceFromTrain('Sài Gòn', 'Phan Thiết'),
    trainCode: 'SPT2'
  },
  {
    id: 6,
    trainName: 'Tàu du lịch SNT2',
    from: 'Sài Gòn',
    to: 'Nha Trang',
    duration: getDurationFromTrain('Sài Gòn', 'Nha Trang'),
    price: getPriceFromTrain('Sài Gòn', 'Nha Trang'),
    trainCode: 'SNT2'
  }
]