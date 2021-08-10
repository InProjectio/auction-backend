const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const myPlugins = [mongoosePaginate]

const packageSchema = new mongoose.Schema({
  packageSeq: Number,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  userCreated: { type: mongoose.Schema.Types.ObjectId, ref: 'UserMapping' },
  packageCode: { type: String, uppercase: true },
  packageName: String, // ten goi thau
  postTime: String,
  notiType: { type: String, enum: ['FIRSTIME', 'CHANGE', 'CANCEL'], default: 'FIRSTIME' },
  procurementPlan: String,// ke hoach lua chon nha thau
  packagesRelation: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Package' }],
  biddings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bidding' }],
  offeree: { type: mongoose.Schema.Types.ObjectId, ref: 'Entity' },
  project: Number,
  projectName: String,
  field: String,
  orderProfile: String,// ten ben moi thau
  publicTime: String,
  biddingType: { type: String, enum: ['PUBLIC', 'PRIVATE'] },
  biddingMethod: { type: String },
  contractType: String,
  foundingSource: String, // nguon von
  fromContractDate: String,
  toContractDate: String,
  fromReceiveDate: String,
  toReceiveDate: String,
  insuranceFee: Number,
  validityDay: Number,
  receiveBidLocation: String,// dia diem nhan thau
  workplace: String,
  openDate: String, // time mo thau,
  closeDate: String, // time dong thau
  openLocation: String,// dia diem mo thau
  estimate: Number, // du toan
  content: String,
  transactionHash: String,
  documentAttackFiles: [String],
  status: { type: String, enum: ['BIDDING', 'SELECTING', 'CLOSING', 'CANCEL'] },
  totalViews: { type: Number, default: 1 },
  totalFollows: { type: Number, default: 1 },
  // userViews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  userFollows: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: String,
  updatedAt: String,
  updatedAt: String,
  updatedBy: String,
  deletedAt: String,
  textSearch: String,
})

packageSchema.index({ textSearch: 'text' })

myPlugins.forEach(plugin => packageSchema.plugin(plugin))

packageSchema.method('genCode', function () {
  if (this.packageSeq) {
    this.packageCode = `PKG${this.packageSeq}`
  }
})

module.exports = packageSchema