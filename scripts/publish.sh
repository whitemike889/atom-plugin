npm run publish:prepare &&
npm run package:public &&
npm run commit:public &&
eval "apm publish $1" &&
npm run commit:private;
