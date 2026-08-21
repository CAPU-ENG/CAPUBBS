import assert from 'node:assert/strict';
import { replaceLegacySignatureFloorScripts } from './src/utils/signatureFloorLink.ts';

globalThis.window = {
  location: {
    origin: 'http://localhost:5173',
  },
};

const legacyFloorSelectorSignature = '<script>$.get("?p=2&bid=4&tid=19989#22",function(data){sign=$($.parseHTML(data)).find("#floor9").html()+"<br><br>";});</script>哈哈哈哈哈';
assert.equal(
  replaceLegacySignatureFloorScripts(legacyFloorSelectorSignature),
  '[post bid=4 tid=19989 pid=22]哈哈哈哈哈',
);

const spacedSingleQuoteSignature = "<script>$.get('?p=3&amp;bid=4&amp;tid=19989#30', function(data) { sign = $($.parseHTML(data)) . find ( '#floor2' ).html(); });</script>";
assert.equal(
  replaceLegacySignatureFloorScripts(spacedSingleQuoteSignature),
  '[post bid=4 tid=19989 pid=27]',
);

const hashFallbackSignature = '<script>$.get("?p=2&bid=4&tid=19989#22",function(data){sign=data;});</script>';
assert.equal(
  replaceLegacySignatureFloorScripts(hashFallbackSignature),
  '[post bid=4 tid=19989 pid=23]',
);

console.log('legacy signature floor link verification passed (3 cases)');
