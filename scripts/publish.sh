npm run publish:prepare &&
npm run package:public &&
npm run commit:public &&
eval "cd public; apm publish $1; cd ..;" &&
npm run commit:private;
