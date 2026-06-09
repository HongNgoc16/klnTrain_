const BaseRepository = require('./BaseRepository')
const { TaiKhoan } = require('../models')

class TaiKhoanRepository extends BaseRepository {
  constructor() {
    super(TaiKhoan)
  }

  async findByEmail(email) {
    return this.findOne({ email: email.toLowerCase().trim() })
  }

  async emailExists(email) {
    const count = await this.count({ email: email.toLowerCase().trim() })
    return count > 0
  }
}

module.exports = new TaiKhoanRepository()
